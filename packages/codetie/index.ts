import codetiePkg from './package.json' assert { type: 'json' }
import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: {
    name: codetiePkg.name,
    version: codetiePkg.version,
    description: codetiePkg.description,
  },
  subCommands: {
    'build': () => import('./commands/build').then((r) => r.default),
    'generate': () => import('./commands/generate').then((r) => r.default),
    'preview': () => import('./commands/preview').then((r) => r.default),
  }
});

runMain(main);