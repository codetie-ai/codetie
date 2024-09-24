import { defineCommand } from "citty";
import { resolve,  } from 'pathe'
import { exists } from '../utils/fs'
import { consola } from 'consola'
import {$} from 'execa';

export default defineCommand({
  meta: {
    name: "generate",
    description: "Generate the project",
  },
  args: {
    cwd: {
      type: 'string',
      description: 'The directory to generate the project in',
    }
  },
  async run(ctx) {
    const argsCwd = typeof ctx.args.cwd === 'boolean' ? undefined : ctx.args.cwd
    const cwd = resolve(argsCwd || '.')
    
    try {
      const { stdout } = await $`command -v xcodegen &> /dev/null`
      if (!stdout) {
        throw new Error()
      }
    } catch (error) {
      consola.error('Error: XcodeGen is not installed. Please install XcodeGen before running this script.')
      consola.box('You can install XcodeGen using Homebrew:\n\nbrew install xcodegen')
      process.exit(1)
    }

    consola.start('Generating Xcode project using XcodeGen...')

    try {
      await $(`xcodegen generate`, [], { cwd, shell: true })
      consola.success('Xcode project generated successfully.')
    } catch (error) {
      consola.error(error)
      process.exit(1)
    }
  }
})