import { defineCommand } from 'citty'
import codetiePkg from '../package.json' assert { type: 'json' }
import { commands } from './commands'

export const main = defineCommand({
  meta: {
    name: codetiePkg.name,
    version: codetiePkg.version,
    description: codetiePkg.description,
  },
  subCommands: commands,
}) as any
