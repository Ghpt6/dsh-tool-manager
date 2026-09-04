import { afterEach, describe, expect, it } from 'vitest'
import { ToolCallId } from '@deepseek-ai/dsh-llm'
import { harness, type Harness } from './helpers.ts'
import { readCatalog } from '../src/catalog.ts'
import WorkerRuntime from '@deepseek-ai/dsh-code-runtime-worker-thread'

let h: Harness | undefined
afterEach(async () => { await h?.close(); h = undefined })

describe('real Cordis tool pipeline', () => {
  it('discovers tools beyond the preset catalog and controls them through the same policy', async () => {
    h = await harness()
    const remove = h.probe('additional_tool')
    h.probe('constructor')
    const parent = h.agent('parent')
    h.probe('session_tool', parent.ctx)
    h.agent('child', parent)
    const catalog = readCatalog(h.ctx, [])
    expect(catalog.tools.find(tool => tool.name === 'additional_tool')).toMatchObject({
      loaded: true, category: 'other', description: 'Fixture additional_tool', sessionCount: 2,
    })
    expect(catalog.tools.find(tool => tool.name === 'constructor')).toMatchObject({ category: 'other', loaded: true })
    expect(catalog.tools.filter(tool => tool.name === 'session_tool')).toEqual([
      { name: 'session_tool', category: 'other', description: 'Fixture session_tool', loaded: true, sessionCount: 2 },
    ])
    await h.setDisabled(['additional_tool', 'session_tool'])
    expect((await h.assemble(parent)).tools.map(tool => tool.name)).toEqual(['constructor'])
    expect((await h.execute('additional_tool')).isError).toBe(true)
    expect((await h.execute('session_tool', parent)).isError).toBe(true)
    expect(h.calls).toEqual([])
    remove()
    expect(readCatalog(h.ctx, ['additional_tool']).tools.find(tool => tool.name === 'additional_tool'))
      .toMatchObject({ loaded: false, category: 'other' })
    h.probe('additional_tool')
    expect((await h.execute('additional_tool')).isError).toBe(true)
    await h.setDisabled([])
    expect((await h.execute('additional_tool')).isError).toBe(false)
    expect((await h.execute('session_tool', parent)).isError).toBe(false)
  })

  it('only offers dynamically discovered names that settings can manage', async () => {
    h = await harness()
    h.probe('bad.name')
    h.probe('a'.repeat(129))
    h.probe('supported-tool_2')
    const names = readCatalog(h.ctx, []).tools.map(tool => tool.name)
    expect(names).toContain('supported-tool_2')
    expect(names).not.toContain('bad.name')
    expect(names).not.toContain('a'.repeat(129))
  })

  it('removes write from requests and blocks its body while read stays available', async () => {
    h = await harness()
    h.probe('read'); h.probe('write'); h.probe('pwsh')
    await h.setDisabled(['write', 'pwsh'])
    expect((await h.assemble()).tools.map(tool => tool.name)).toEqual(['read'])
    expect((await h.execute('write')).isError).toBe(true)
    expect((await h.execute('pwsh')).isError).toBe(true)
    expect((await h.execute('read')).isError).toBe(false)
    expect(h.calls).toEqual(['read'])
    expect(readCatalog(h.ctx, ['write']).tools.find(tool => tool.name === 'write')?.loaded).toBe(true)
    await h.setDisabled([])
    expect((await h.execute('write')).isError).toBe(false)
  })

  it('covers existing/new agents, own registrations and inherited child tools', async () => {
    h = await harness()
    const parent = h.agent('parent')
    h.probe('write', parent.ctx)
    const existing = h.agent('existing')
    h.probe('write', existing.ctx)
    await h.setDisabled(['write'])
    const child = h.agent('child', parent)
    for (const agent of [parent, existing, child]) {
      expect((await h.assemble(agent)).tools.some(tool => tool.name === 'write')).toBe(false)
      expect((await h.execute('write', agent)).isError).toBe(true)
    }
    const catalog = readCatalog(h.ctx, ['write'])
    expect(catalog.sessionCount).toBe(3)
    expect(catalog.tools.find(tool => tool.name === 'write')).toMatchObject({ loaded: true, sessionCount: 3 })
    expect(h.calls).toEqual([])
  })

  it('cannot be force-allowed by pre policies and does not override other denials', async () => {
    h = await harness()
    h.probe('write')
    const off = h.ctx.on('tools/pre-execute', async () => ({ kind: 'allow' }))
    await h.setDisabled(['write'])
    expect((await h.execute('write')).isError).toBe(true)
    off()
    h.ctx.on('tools/pre-execute', async () => ({ kind: 'deny', reason: 'Other policy' }))
    await h.setDisabled([])
    expect((await h.execute('write')).error?.message).toContain('Other policy')
    expect(h.calls).toEqual([])
  })

  it('checks nested dispatch against current policy', async () => {
    h = await harness()
    const current = h
    current.probe('write')
    current.definition('nested', async (_args, exec) => {
      const result = await current.ctx.tools.execute({
        name: 'write', arguments: {}, callId: ToolCallId('nested-write'),
        parent: exec.token, signal: exec.signal,
      })
      return result.isError ? 'blocked' : 'executed'
    })
    await current.setDisabled(['write'])
    expect((await current.execute('nested')).content).toEqual([{ type: 'text', text: 'blocked' }])
    expect(current.calls).toEqual([])
  })

  it.each(['ptc', 'both'] as const)('blocks real run_code subcalls in %s while keeping the SDK limitation explicit', async mode => {
    h = await harness(undefined, mode)
    await h.ctx.plugin(WorkerRuntime)
    h.probe('write'); h.probe('read')
    await h.setDisabled(['write'])
    const agent = h.agent(`code-${mode}`)
    const assembly = await h.assemble(agent)
    expect(assembly.sections.find(section => section.name === 'tools:sdk')?.text).toContain('write')
    expect(assembly.tools.some(tool => tool.name === 'write')).toBe(false)
    const catalog = readCatalog(h.ctx, ['write'])
    expect(catalog.codeSessionCount).toBe(1)
    expect(catalog.tools.some(tool => tool.name === 'run_code')).toBe(false)
    const result = await h.ctx.tools.execute({
      name: 'run_code', callId: ToolCallId('code-test'),
      arguments: { code: 'await tools.read({}); await tools.write({})', description: 'Verify tool controls' },
      agent, signal: new AbortController().signal,
    })
    expect(result.isError).toBe(true)
    expect(JSON.stringify(result)).toContain('disabled in Tool Manager')
    expect(h.calls).toEqual(['read'])
  })

  it('uses newly committed settings after an approval wait and leaves running calls intact', async () => {
    h = await harness()
    h.probe('write')
    let release!: () => void
    let entered!: () => void
    const waiting = new Promise<void>(resolve => { entered = resolve })
    const gate = new Promise<void>(resolve => { release = resolve })
    const off = h.ctx.on('tools/pre-execute', async (_exec, next) => { entered(); await gate; return next() })
    const call = h.execute('write')
    await waiting
    await h.setDisabled(['write'])
    release()
    expect((await call).isError).toBe(true)
    off()
    await h.setDisabled([])
    let finish!: () => void
    let started!: () => void
    const running = new Promise<void>(resolve => { started = resolve })
    h.definition('slow', async () => { started(); await new Promise<void>(resolve => { finish = resolve }); return 'done' })
    const slow = h.execute('slow')
    await running
    await h.setDisabled(['slow'])
    finish()
    expect((await slow).isError).toBe(false)
    expect((await h.execute('slow')).isError).toBe(true)
  })

  it('disposes filters, guards and HTTP routes when unloaded', async () => {
    h = await harness()
    h.probe('write')
    await h.setDisabled(['write'])
    const origin = await h.serve()
    expect((await fetch(`${origin}/tool-manager/api/catalog`)).ok).toBe(true)
    await h.fiber.dispose()
    expect((await h.assemble()).tools.map(tool => tool.name)).toContain('write')
    expect((await h.execute('write')).isError).toBe(false)
    expect((await fetch(`${origin}/tool-manager/api/catalog`)).status).toBeGreaterThanOrEqual(400)
  })
})
