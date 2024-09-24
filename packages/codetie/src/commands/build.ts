import { defineCommand } from "citty";
import { resolve,  } from 'pathe'
import { exists } from '../utils/fs'
import { consola } from 'consola'
import { loadConfig } from "c12";
import {$} from 'execa';

export default defineCommand({
  meta: {
    name: "build",
    description: "Build the project",
  },
  args: {
    cwd: {
      type: 'string',
      description: 'The directory to build the project in',
    }
  },
  async run(ctx) {
    const argsCwd = typeof ctx.args.cwd === 'boolean' ? undefined : ctx.args.cwd
    const cwd = resolve(argsCwd || '.')
    const configName = 'codetie.yml'
    const projectConfigPath = resolve(cwd, configName)

    if (!(await exists(projectConfigPath))) {
      consola.error(`Project config ${configName} not found`)
      process.exit(1)
    }

    const { config } = await loadConfig({ cwd, configFile: configName })

    if (!await exists(resolve(cwd, `${config.project_name}.xcodeproj/project.pbxproj`))) {
      consola.error(`${config.project_name}.xcodeproj/project.pbxproj not found. Run 'codetie generate' to generate the project first.`)
      process.exit(1)
    }

    consola.start(`Building ${config.project_name} for iOS Simulator...`)

    const simulator_name = "iPhone 15 Pro";
    const simulator_os = "17.0";
    const build_dir = resolve(cwd, 'build')

    try {
      await $(`xcodebuild -project ${config.project_name}.xcodeproj -scheme ${config.project_name} -configuration Debug -destination "platform=iOS Simulator,name=${ simulator_name },OS=${ simulator_os }" -derivedDataPath ${ build_dir }`, [], { cwd, shell: true })
      const appPath = resolve(cwd, `build/Build/Products/Debug-iphonesimulator/${config.project_name}.app`)
      if (!(await exists(appPath))) {
        throw new Error(`App bundle not found at expected location: ${appPath}`)
      }
      consola.success(`${config.project_name} built successfully!`)
    } catch (error) {
      consola.error(error)
      process.exit(1)
    }
  }
})