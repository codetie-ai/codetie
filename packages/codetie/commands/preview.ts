import { defineCommand } from "citty";
import { resolve,  } from 'pathe'
import { exists } from '../utils/fs'
import { consola } from 'consola'
import { loadConfig } from "c12";
import {$} from 'execa';
import { destr } from 'destr';

interface ISimulator {
  dataPath: string,
  dataPathSize: number,
  logPath: string,
  udid: string,
  isAvailable: boolean,
  name: string,
  deviceTypeIdentifier: string,
  state: string,
}

export default defineCommand({
  meta: {
    name: "preview",
    description: "Preview the project",
  },
  args: {
    cwd: {
      type: 'string',
      description: 'The directory to preview the project from',
    }
  },
  async run(ctx) {
    const argsCwd = typeof ctx.args.cwd === 'boolean' ? undefined : ctx.args.cwd
    const cwd = resolve(argsCwd || '.')
    const configName = 'codetie.yml'
    const projectConfigPath = resolve(cwd, configName)

    try {
      if (!(await exists(projectConfigPath))) {
        consola.error(`Project config ${configName} not found`)
        process.exit(1)
      }
  
      const { config } = await loadConfig({ cwd, configFile: configName })
      const appPath = resolve(cwd, `build/Build/Products/Debug-iphonesimulator/${config.project_name}.app`)
  
      if (!(await exists(appPath))) {
        throw new Error(`App bundle not found at expected location: ${appPath}`)
      }
      
      // Get the list of installed iOS simulators
      const { stdout } = await $(`xcrun simctl list devices available --json`, [], { shell: true})
      // .pipe(`jq '.devices[] | .[]'`, [], { shell: true})
      const deviceObject = destr<{ devices: { [key: string]: ISimulator[] } }>(`${stdout}`)
      const simulators = Object.values(deviceObject.devices).flat()

      if (simulators.length === 0) {
        throw new Error('No iOS simulators found.')
      }

      const selectedSimulator = await consola.prompt('Select an iOS simulator to start:', {
        type: 'select',
        required: true,
        options: simulators.map(simulator => simulator.name)
      })

      const simulatorId = (simulators.find(simulator => simulator.name === selectedSimulator) as ISimulator).udid
  
      consola.box([
        `Using the following settings:\n`,
        `Simulator: ${selectedSimulator}`,
        `Simulator ID: ${simulatorId}`,
        `Project Name: ${config.project_name}`,
        `App Bundle ID: ${config.bundle_id_prefix}.${config.project_name}`,
        `App Path: ${appPath}`
      ].join('\n'))

      consola.start(`Starting simulator: ${selectedSimulator}`)

      consola.info("Booting simulator...")
      await $(`xcrun simctl boot "${simulatorId}"`, [], { shell: true })
      
      consola.info("Waiting for simulator to boot...");
      while ((await $(`xcrun simctl list devices | grep "${simulatorId}" | grep -o "Booted"`, [], { shell: true })).stdout.trim() !== "Booted") {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      consola.info("Opening Simulator...");
      await $(`open -a Simulator`, [], { shell: true });

      consola.info("Installing app...");
      await $(`xcrun simctl install booted "${appPath}"`, [], { shell: true });

      consola.info("Launching app...");
      await $(`xcrun simctl launch booted "${config.bundle_id_prefix}.${config.project_name}"`, [], { shell: true });

      consola.success("Done!");
    } catch (error) {
      consola.error(error)
    }
  }
})