import fs from "fs-extra";
import { runMain, defineCommand } from "citty";
import { consola } from "consola";
import { resolve, dirname } from "pathe";
import { fileURLToPath } from "node:url";
import {
  exists,
  mkDir,
  isEmpty,
  readDir,
  writeFile,
  readFile,
  copyFile,
  rename,
  deleteFile,
} from "./utils/fs";
import { initPrompts, installDependenciesPrompts } from "./prompts";
import Mustache from "mustache";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templateDir = resolve(__dirname, "../template");

const renameFiles: Record<string, string | undefined> = {
  _gitignore: ".gitignore",
};

const main = defineCommand({
  args: {
    cwd: {
      type: "string",
      description: "The directory to create the project in",
    },
  },
  async run(ctx) {
    consola.log(templateDir);
    const argsCwd =
      ctx.args._[0] ?? (typeof ctx.args.cwd === "string" ? ctx.args.cwd : ".");
    const cwd = resolve(argsCwd);

    try {
      // 1. prompts
      const {
        projectName,
        bundleIdPrefix,
        deploymentTarget,
        xcodeVersion,
        swiftVersion,
        appVersion,
        buildNumber,
      } = await initPrompts();

      // 2. check if cwd is empty
      const root = resolve(cwd, projectName);
      if (exists(root)) {
        if (!isEmpty(root)) {
          throw new Error(
            `Directory ${root} is not empty. Please choose a different directory or empty it.`
          );
        }
      } else {
        mkDir(root);
      }

      // 3. copy template
      const templateVariables = {
        PROJECT_NAME: projectName,
        BUNDLE_ID_PREFIX: bundleIdPrefix,
        DEPLOYMENT_TARGET: deploymentTarget,
        XCODE_VERSION: xcodeVersion,
        SWIFT_VERSION: swiftVersion,
        APP_VERSION: appVersion,
        BUILD_NUMBER: buildNumber,
      };

      const files = readDir(templateDir);
      for (const file of files) {
        const srcPath = resolve(file.path, file.name);
        const targetParentPath = resolve(
          root,
          file.path.replace(new RegExp(`^${templateDir}\\/?`, "g"), "")
        );
        const destPath = resolve(
          targetParentPath,
          renameFiles[file.name] ?? file.name
        );
        const stat = fs.statSync(srcPath);
        if (stat.isDirectory()) {
          mkDir(destPath);
        } else if (file.name.endsWith(".mustache")) {
          if (exists(srcPath)) {
            const content = readFile(srcPath);
            const rendered = Mustache.render(content, templateVariables);
            writeFile(destPath.replace(/\.mustache$/g, ""), rendered);
          }
        } else {
          copyFile(srcPath, destPath);
        }
      }
      // 4. rename project entry file and content
      const oldMainSwift = resolve(root, "_project", "_main.swift");
      const newMainSwift = resolve(root, "_project", `${projectName}App.swift`);
      if (exists(oldMainSwift)) {
        const content = readFile(oldMainSwift).replace(
          "HelloWorldApp",
          `${projectName}App`
        );
        writeFile(newMainSwift, content);
        deleteFile(oldMainSwift);
      }
      // 5. rename _project folder
      rename(resolve(root, "_project"), resolve(root, projectName));

      // 6. generate codetie.yml
      const codetieConfig = {
        project_name: projectName,
        bundle_id_prefix: bundleIdPrefix,
        deployment_target: deploymentTarget,
        xcode_version: xcodeVersion,
        swift_version: swiftVersion,
        app_version: appVersion,
        build_number: buildNumber,
      };
      writeFile(
        resolve(root, "codetie.yml"),
        JSON.stringify(codetieConfig, null, 2)
      );

      // 6. install dependencies
      await installDependenciesPrompts(root);

      consola.success("Project setup complete! Happy coding! 🎈");
      consola.box(
        "Next steps:\n\ncd " + projectName + "\npnpm install\npnpm dev"
      );
    } catch (error) {
      consola.error(error);
      process.exit(1);
    }
  },
});

runMain(main);
