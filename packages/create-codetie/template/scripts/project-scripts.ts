import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as yaml from 'js-yaml';

const execAsync = promisify(exec);

async function buildProject(projectName: string): Promise<void> {
    try {
        const { stdout, stderr } = await execAsync(`
      xcodebuild -project ${projectName}.xcodeproj -scheme ${projectName} \
      -configuration Debug \
      DEVELOPMENT_TEAM="" \
      CODE_SIGN_IDENTITY="" \
      CODE_SIGNING_REQUIRED=NO \
      CODE_SIGNING_ALLOWED=NO \
      clean build
    `);

        console.log(stdout);
        if (stderr) console.error(stderr);

        console.log("✅ Project built successfully!");
    } catch (error) {
        console.error("❌ Project build failed:", error);
        process.exit(1);
    }
}

async function runSimulator(simulatorName?: string): Promise<void> {
    try {
        if (!simulatorName) {
            const simulatorsYaml = await fs.readFile('simulators.yml', 'utf8');
            const simulators = yaml.load(simulatorsYaml) as { default: string };
            simulatorName = simulators.default;
        }

        await execAsync(`xcrun simctl boot "${simulatorName}"`);
        await execAsync(`xcrun simctl launch booted {{APP_BUNDLE_ID}}`);
        await execAsync('open -a Simulator');

        console.log(`✅ Simulator "${simulatorName}" launched successfully!`);
    } catch (error) {
        console.error("❌ Failed to launch simulator:", error);
        process.exit(1);
    }
}

// Main function to handle command-line arguments
async function main(): Promise<void> {
    const [, , command, ...args] = process.argv;

    switch (command) {
        case 'build':
            await buildProject(args[0] || '{{PROJECT_NAME}}');
            break;
        case 'run':
            await runSimulator(args[0]);
            break;
        default:
            console.error('Unknown command. Use "build" or "run".');
            process.exit(1);
    }
}

main().catch(console.error);