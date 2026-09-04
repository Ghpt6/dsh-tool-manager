import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-tools'
import { BUILTIN_TOOLS, type ToolRow } from './contracts.ts'

/** A root-only query misses tools contributed by agent presets and scoped plugins. */
export function readCatalog(ctx: Context, disabledTools: string[]) {
  const rows = new Map<string, ToolRow>()
  for (const name of new Set([...Object.keys(BUILTIN_TOOLS), ...disabledTools])) {
    const category = Object.hasOwn(BUILTIN_TOOLS, name) ? BUILTIN_TOOLS[name]! : 'other'
    rows.set(name, { name, category, description: '', loaded: false, sessionCount: 0 })
  }
  const add = (schemas: ReturnType<typeof ctx.tools.schemas>, isSession: boolean) => {
    for (const schema of schemas) {
      const row = rows.get(schema.name)
      if (!row) continue
      row.loaded = true
      row.description ||= schema.description.slice(0, 1000)
      if (isSession) row.sessionCount++
    }
  }
  add(ctx.tools.schemas(), false)
  const agents = ctx.agents.list()
  let codeSessionCount = 0
  for (const agent of agents) {
    const schemas = ctx.tools.schemas(agent)
    add(schemas, true)
    if (schemas.some(tool => tool.name === 'run_code')) codeSessionCount++
  }
  return { tools: [...rows.values()], sessionCount: agents.length, codeSessionCount }
}
