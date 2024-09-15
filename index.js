#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs');
const mustache = require('mustache');
const path = require('path');
const chalk = require('chalk');

(async () => {
    console.log(chalk.green('\nWelcome to the Cursor-XCode-Swift-Sync Project Setup\n'));

    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'setupType',
            message: 'Select setup type:',
            choices: ['Minimal', 'Advanced'],
            default: 'Minimal'
        },
        {
            type: 'input',
            name: 'projectName',
            message: 'Enter Project Name:',
            default: 'MyZunderApp'
        },
        {
            type: 'input',
            name: 'bundleIdPrefix',
            message: 'Enter Bundle ID Prefix:',
            default: 'com.zunderai'
        },
        {
            type: 'input',
            name: 'deploymentTarget',
            message: 'Enter Deployment Target iOS Version:',
            default: '17.0'
        },
        {
            type: 'input',
            name: 'xcodeVersion',
            message: 'Enter Xcode Version:',
            default: '15.3'
        },
        {
            type: 'input',
            name: 'swiftVersion',
            message: 'Enter Swift Version:',
            default: '5.10.1'
        },
        {
            type: 'input',
            name: 'appVersion',
            message: 'Enter App Version:',
            default: '1.0.0'
        },
        {
            type: 'input',
            name: 'buildNumber',
            message: 'Enter Build Number:',
            default: '1'
        }
    ]);

    const variables = {
        PROJECT_NAME: answers.projectName,
        BUNDLE_ID_PREFIX: answers.bundleIdPrefix,
        DEPLOYMENT_TARGET: answers.deploymentTarget,
        XCODE_VERSION: answers.xcodeVersion,
        SWIFT_VERSION: answers.swiftVersion,
        APP_VERSION: answers.appVersion,
        BUILD_NUMBER: answers.buildNumber
    };

    // Create codetie.yml
    fs.writeFileSync('codetie.yml', mustache.render(
        `project_name: {{PROJECT_NAME}}
bundle_id_prefix: {{BUNDLE_ID_PREFIX}}
deployment_target: {{DEPLOYMENT_TARGET}}
xcode_version: {{XCODE_VERSION}}
swift_version: {{SWIFT_VERSION}}
app_version: {{APP_VERSION}}
build_number: {{BUILD_NUMBER}}
`, variables));

    console.log(chalk.blue('\nCreated codetie.yml'));

    // Generate project.yml from template
    const projectYmlTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'project.yml.mustache'), 'utf-8');
    fs.writeFileSync('project.yml', mustache.render(projectYmlTemplate, variables));

    console.log(chalk.blue('Generated project.yml'));

    // Generate other necessary files
    const filesToGenerate = [
        'scripts/generate.sh',
        'scripts/run_simulator.sh',
        'scripts/start_build_server.sh',
        '.vscode/tasks.json',
        '.vscode/settings.json',
        '.vscode/extensions.json'
    ];

    filesToGenerate.forEach(file => {
        const templatePath = path.join(__dirname, 'templates', file + '.mustache');
        const outputPath = file;
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const outputContent = mustache.render(templateContent, variables);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, outputContent, { mode: 0o755 });
        console.log(chalk.blue(`Generated ${outputPath}`));
    });

    console.log(chalk.green('\nProject setup complete.\n'));
})();
