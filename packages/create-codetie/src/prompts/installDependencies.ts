import { consola } from "consola";
import { runCommand } from "codetie";

export async function installDependenciesPrompts(cwd: string) {
  const generateProject = await consola.prompt(
    "Do you want to generate the Xcode project now?",
    {
      type: "confirm",
    }
  );
  if (typeof generateProject === "symbol") {
    process.exit(1);
  }
  if (generateProject) {
    await runCommand("generate", ["", "", "--cwd", cwd]);

    const startSimulator = await consola.prompt(
      "Do you want to start the project with the simulator now?",
      {
        type: "confirm",
      }
    );
    if (typeof startSimulator === "symbol") {
      process.exit(1);
    }
    if (startSimulator) {
      await runCommand("build", ["", "", "--cwd", cwd]);
      await runCommand("preview", ["", "", "--cwd", cwd]);
    }
  }
}
