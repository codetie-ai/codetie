import fs from 'fs-extra';
import path from 'path';
import minimist from 'minimist';
import prompts from 'prompts';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import Mustache from 'mustache';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const renameFiles: Record<string, string | undefined> = {
    _gitignore: '.gitignore',
};

async function init() {
    console.log(chalk.green('Welcome to the codetie (Sync swift + xcode) Project Setup 🚀\n'));

    const argv = minimist(process.argv.slice(2), { string: ['_'] });
    let targetDir = argv._[0];
    const defaultProjectName = targetDir || 'codetie-project';

    const result = await prompts([
        {
            type: targetDir ? null : 'text',
            name: 'projectName',
            message: 'Project name:',
            initial: defaultProjectName,
            onState: (state) => {
                targetDir = state.value.trim() || defaultProjectName;
            },
        },
        // ... (keep your other prompts)
    ]);

    const root = path.join(process.cwd(), targetDir);

    if (fs.existsSync(root)) {
        if (fs.readdirSync(root).length === 0) {
            console.log(`Directory ${chalk.cyan(targetDir)} is empty. Proceeding with project creation.`);
        } else {
            console.log(chalk.red(`Error: Directory ${targetDir} is not empty. Please choose a different directory or empty it.`));
            process.exit(1);
        }
    } else {
        fs.mkdirSync(root, { recursive: true });
    }

    const templateDir = path.resolve(__dirname, '../template');

    const write = (file: string, content?: string) => {
        const targetPath = path.join(root, renameFiles[file] ?? file);
        if (content) {
            fs.writeFileSync(targetPath, content);
        } else {
            copy(path.join(templateDir, file), targetPath);
        }
    };

    const files = fs.readdirSync(templateDir);
    for (const file of files) {
        write(file);
    }

    // Process mustache templates
    const templateVariables = {
        projectName: targetDir,
        setupType: result.setupType,
        bundleIdPrefix: result.bundleIdPrefix,
        deploymentTarget: result.deploymentTarget,
        xcodeVersion: result.xcodeVersion,
        swiftVersion: result.swiftVersion,
        appVersion: result.appVersion,
        buildNumber: result.buildNumber,
    };

    const mustacheFiles = files.filter(file => file.endsWith('.mustache'));
    for (const file of mustacheFiles) {
        const content = fs.readFileSync(path.join(templateDir, file), 'utf-8');
        const rendered = Mustache.render(content, templateVariables);
        write(file.replace('.mustache', ''), rendered);
        fs.removeSync(path.join(root, file)); // Remove the original .mustache file
    }

    // Generate codetie.yml
    const codetieConfig = {
        project_name: targetDir,
        setup_type: result.setupType,
        bundle_id_prefix: result.bundleIdPrefix,
        deployment_target: result.deploymentTarget,
        xcode_version: result.xcodeVersion,
        swift_version: result.swiftVersion,
        app_version: result.appVersion,
        build_number: result.buildNumber,
    };
    fs.writeFileSync(path.join(root, 'codetie.yml'), JSON.stringify(codetieConfig, null, 2));

    console.log(chalk.green('\n✅ Project setup complete! Happy coding! 🎈\n'));
    console.log('\nNext steps:');
    console.log(`  cd ${targetDir}`);
    console.log('  pnpm install');
    console.log('  pnpm dev');
}

function copy(src: string, dest: string) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        copyDir(src, dest);
    } else {
        fs.copyFileSync(src, dest);
    }
}

function copyDir(srcDir: string, destDir: string) {
    fs.mkdirSync(destDir, { recursive: true });
    for (const file of fs.readdirSync(srcDir)) {
        const srcFile = path.resolve(srcDir, file);
        const destFile = path.resolve(destDir, file);
        copy(srcFile, destFile);
    }
}

init().catch((e) => {
    console.error(chalk.red('Error:'), e);
    process.exit(1);
});