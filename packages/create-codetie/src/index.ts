import fs from 'fs-extra';
import path from 'path';
import minimist from 'minimist';
import prompts from 'prompts';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import Mustache from 'mustache';
import { execSync } from 'child_process';

// Add type declarations
declare module 'fs-extra';
declare module 'mustache';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const renameFiles: Record<string, string | undefined> = {
    _gitignore: '.gitignore',
};

const mustacheFiles = [
    'project.yml.mustache',
    'scripts/run_simulator.sh.mustache',
    '.vscode/tasks.json.mustache',
    '.vscode/settings.json.mustache'
];

async function init() {
    console.log(chalk.green('Welcome to the codetie (Sync swift + xcode) Project Setup 🚀\n'));

    const argv = minimist(process.argv.slice(2), {
        string: ['_', 'cwd'],
        boolean: ['debug']
    });

    let targetDir = argv._[0];
    const defaultProjectName = targetDir || 'codetie-project';
    const debug = argv.debug || false;
    const cwd = argv.cwd ? path.resolve(argv.cwd) : process.cwd();

    // Debug logging function
    const debugLog = (message: string) => {
        if (debug) {
            const logMessage = `${new Date().toISOString()} - ${message}\n`;
            fs.appendFileSync(path.join(cwd, targetDir, 'debug.log'), logMessage);
        }
    };

    if (debug) {
        console.log('Debug mode enabled');
        debugLog('Debug mode enabled');
        debugLog(`Command line arguments: ${JSON.stringify(argv)}`);
        debugLog(`Current working directory: ${cwd}`);
    }

    const questions = [
        {
            type: targetDir ? null : 'text',
            name: 'projectName',
            message: 'Project name:',
            initial: defaultProjectName,
            onState: (state) => {
                targetDir = state.value.trim() || defaultProjectName;
            },
        },
        {
            type: 'text',
            name: 'bundleIdPrefix',
            message: 'Enter Bundle ID Prefix:',
            initial: 'com.zunderai',
        },
        {
            type: 'text',
            name: 'deploymentTarget',
            message: 'Enter Deployment Target iOS Version:',
            initial: '17.0',
        },
        {
            type: 'text',
            name: 'xcodeVersion',
            message: 'Enter Xcode Version:',
            initial: '15.3',
        },
        {
            type: 'text',
            name: 'swiftVersion',
            message: 'Enter Swift Version:',
            initial: '5.10.1',
        },
        {
            type: 'text',
            name: 'appVersion',
            message: 'Enter App Version:',
            initial: '1.0.0',
        },
        {
            type: 'text',
            name: 'buildNumber',
            message: 'Enter Build Number:',
            initial: '1',
        },
    ];

    const result = await prompts(questions);

    const root = path.join(cwd, targetDir);

    if (fs.existsSync(root)) {
        if (fs.readdirSync(root).length === 0) {
            console.log(`Directory ${chalk.cyan(root)} is empty. Proceeding with project creation.`);
            debugLog(`Directory ${root} is empty. Proceeding with project creation.`);
        } else {
            console.log(chalk.red(`Error: Directory ${root} is not empty. Please choose a different directory or empty it.`));
            debugLog(`Error: Directory ${root} is not empty. Exiting.`);
            process.exit(1);
        }
    } else {
        fs.mkdirSync(root, { recursive: true });
        debugLog(`Created directory: ${root}`);
    }

    const templateDir = path.resolve(__dirname, '../template');

    const write = (file: string, content?: string) => {
        const targetPath = path.join(root, renameFiles[file] ?? file);
        if (content) {
            fs.ensureDirSync(path.dirname(targetPath));
            fs.writeFileSync(targetPath, content);
            debugLog(`Written file: ${targetPath}`);
        } else {
            copy(path.join(templateDir, file), targetPath);
            debugLog(`Copied file: ${targetPath}`);
        }
    };

    const files = fs.readdirSync(templateDir);
    for (const file of files) {
        write(file);
    }

    // Process mustache templates
    const templateVariables = {
        projectName: targetDir,
        bundleIdPrefix: result.bundleIdPrefix,
        deploymentTarget: result.deploymentTarget,
        xcodeVersion: result.xcodeVersion,
        swiftVersion: result.swiftVersion,
        appVersion: result.appVersion,
        buildNumber: result.buildNumber,
    };

    for (const file of mustacheFiles) {
        const srcPath = path.join(templateDir, file);
        const destPath = path.join(root, file.replace('.mustache', ''));

        if (fs.existsSync(srcPath)) {
            const content = fs.readFileSync(srcPath, 'utf-8');
            const rendered = Mustache.render(content, templateVariables);
            fs.ensureDirSync(path.dirname(destPath));
            fs.writeFileSync(destPath, rendered);
            console.log(`Processed ${file}`);
            debugLog(`Processed and written: ${destPath}`);

            // Remove the Mustache file from the target directory after processing
            const targetMustacheFile = path.join(root, file);
            if (fs.existsSync(targetMustacheFile)) {
                fs.unlinkSync(targetMustacheFile);
                console.log(`Removed ${file} from target directory`);
                debugLog(`Removed Mustache file from target directory: ${targetMustacheFile}`);
            }
        } else {
            console.log(`Warning: ${file} not found in template directory`);
            debugLog(`Warning: ${file} not found in template directory`);
        }
    }

    // Generate codetie.yml
    const codetieConfig = {
        project_name: targetDir,
        bundle_id_prefix: result.bundleIdPrefix,
        deployment_target: result.deploymentTarget,
        xcode_version: result.xcodeVersion,
        swift_version: result.swiftVersion,
        app_version: result.appVersion,
        build_number: result.buildNumber,
    };
    fs.writeFileSync(path.join(root, 'codetie.yml'), JSON.stringify(codetieConfig, null, 2));

    // Ask if the project should be generated
    const { generateProject } = await prompts({
        type: 'confirm',
        name: 'generateProject',
        message: 'Do you want to generate the Xcode project now?',
        initial: true
    });

    if (generateProject) {
        console.log('\nGenerating Xcode project...');
        try {
            execSync('bash scripts/generate.sh', { cwd: root, stdio: 'inherit' });
            console.log(chalk.green('\n✅ Xcode project generated successfully!'));

            // Ask if the user wants to start the project with simulator
            const { startSimulator } = await prompts({
                type: 'confirm',
                name: 'startSimulator',
                message: 'Do you want to start the project with the simulator now?',
                initial: true
            });

            if (startSimulator) {
                console.log('\nStarting the project in simulator...');
                try {
                    execSync('bash scripts/run_simulator.sh', { cwd: root, stdio: 'inherit' });
                    console.log(chalk.green('\n✅ Project started in simulator successfully!'));
                } catch (error) {
                    console.error(chalk.red('\n❌ Failed to start project in simulator:'), error);
                }
            }
        } catch (error) {
            console.error(chalk.red('\n❌ Failed to generate Xcode project:'), error);
        }
    }

    console.log(chalk.green('\n✅ Project setup complete! Happy coding! 🎈\n'));
    debugLog('Project setup complete');

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