import fs from 'fs-extra';
import path from 'path';
import minimist from 'minimist';
import prompts from 'prompts';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        {
            type: 'list',
            name: 'setupType',
            message: 'Select setup type:',
            choices: [
                { title: 'Minimal', value: 'minimal' },
                { title: 'Advanced', value: 'advanced' },
            ],
            initial: 0,
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
    fs.copySync(templateDir, root);

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

init().catch((e) => {
    console.error(chalk.red('Error:'), e);
    process.exit(1);
});