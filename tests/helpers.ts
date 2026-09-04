import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { resolve, join, sep } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import Agents, { type Agent } from '@deepseek-ai/dsh-agent'
import { Session, SessionId } from '@deepseek-ai/dsh-session'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import Tools, { type ToolDefinition } from '@deepseek-ai/dsh-tools'
import FileSettings from '@deepseek-ai/dsh-settings-file'
import { createScope } from '@deepseek-ai/dsh-scope'
import WebServer from '@deepseek-ai/dsh-host-webserver'
import * as plugin from '../src/index.ts'
import { NAMESPACE } from '../src/contracts.ts'

const artifacts = resolve('.test-artifacts')
export async function harness(directory?: string, mode: 'native' | 'ptc' | 'both' = 'native') {
  await mkdir(artifacts, { recursive: true })
  const dir = directory ?? await mkdtemp(join(artifacts, 'runtime-'))
  const ctx = new Context()
  await ctx.plugin(Agents)
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(Tools, { mode })
  await ctx.plugin(FileSettings, { path: join(dir, 'settings.json'), watch: false })
  const fiber = await ctx.plugin(plugin)
  let fixtureCtx = ctx
  await ctx.plugin({
    name: 'test-fixtures', inject: ['agents', 'tools', 'systemPrompt'],
    apply(owner: Context) { fixtureCtx = owner },
  })
  const calls: string[] = []
  const probe = (name: string, target = ctx) => target.tools.register({
    name, description: `Fixture ${name}`, parameters: { type: 'object', properties: {} },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: String(value) }] },
    async execute() { calls.push(name); return name },
  })
  const agent = (name: string, parent?: Agent) => {
    const id = SessionId(name)
    const value = { id, session: Session.create(id), status: 'idle' } as unknown as Agent
    const scope = createScope(fixtureCtx, value, parent ? { parent } : {})
    Object.assign(value, { ctx: scope.ctx, cancel: async () => {} })
    scope.ctx.agents.register(value)
    return value
  }
  let seq = 0
  const execute = (name: string, value?: Agent) => ctx.tools.execute({
    name, callId: ToolCallId(`test-${++seq}`), arguments: {}, agent: value,
    signal: new AbortController().signal,
  })
  const setDisabled = (names: string[]) => ctx.settings.update(NAMESPACE, { disabledTools: names })
  const assemble = (value?: Agent) => ctx.systemPrompt.assemble(value ? { scope: value, agent: value } : {})
  return {
    ctx, dir, fiber, probe, agent, calls, execute, setDisabled, assemble,
    definition: (name: string, execute: ToolDefinition['execute']) => ctx.tools.register({
      name, description: name, parameters: { type: 'object', properties: {} },
      output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: String(value) }] },
      execute,
    }),
    async serve() { await ctx.plugin(WebServer, { host: '127.0.0.1', port: 0 }); return `http://127.0.0.1:${ctx.webServer.port}` },
    async close(remove = true) {
      await ctx.fiber.dispose()
      if (remove) {
        const target = resolve(dir)
        if (!target.startsWith(artifacts + sep)) throw new Error('Refusing cleanup outside test artifacts')
        await rm(target, { recursive: true, force: true })
      }
    },
  }
}
export type Harness = Awaited<ReturnType<typeof harness>>
