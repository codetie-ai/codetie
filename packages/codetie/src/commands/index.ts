import type { CommandDef } from 'citty'

const _rDefault = (r: any) => (r.default || r) as Promise<CommandDef>

export const commands = {
  build: () => import('./build').then(_rDefault),
  generate: () => import('./generate').then(_rDefault),
  preview: () => import('./preview').then(_rDefault),
} as const
