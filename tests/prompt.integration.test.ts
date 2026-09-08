import { afterEach, describe, expect, it } from 'vitest'
import { renderPrompt } from '@deepseek-ai/dsh-system-prompt'
import { applyWebFetchTool, applyWebSearchTool } from '@deepseek-ai/dsh-tool-web'
import WorkerRuntime from '@deepseek-ai/dsh-code-runtime-worker-thread'
import { harness, type Harness } from './helpers.ts'

let h: Harness | undefined
afterEach(async () => { await h?.close(); h = undefined })

describe('tool prompt visibility', () => {
  it('filters the real web suite guidance independently and restores it on enable/unload', async () => {
    h = await harness()
    // Register the real tools without a network provider; only assemble prompts.
    await h.ctx.plugin({
      name: 'web-prompt-fixture', inject: ['tools', 'systemPrompt'],
      apply(ctx) {
        applyWebSearchTool(ctx, 5, 3, 30_000, true)
        applyWebFetchTool(ctx, 30_000, 200_000)
      },
    })
    const original = await h.assemble()
    expect(original.tools.map(tool => tool.name)).toEqual(['web_fetch', 'web_search'])
    expect(renderPrompt(original)).toContain('Follow up with web_fetch')

    await h.setDisabled(['web_fetch'])
    let assembly = await h.assemble()
    expect(assembly.tools.map(tool => tool.name)).toEqual(['web_search'])
    expect(assembly.sections.some(section => section.name === 'tool:web_fetch')).toBe(false)
    expect(renderPrompt(assembly)).not.toContain('web_fetch')
    expect(renderPrompt(assembly)).toContain('1–3')
    expect(renderPrompt(assembly)).toContain('external, untrusted data')
    expect(renderPrompt(assembly)).toContain('cite the relevant URLs')

    await h.setDisabled(['web_search'])
    assembly = await h.assemble()
    expect(assembly.tools.map(tool => tool.name)).toEqual(['web_fetch'])
    expect(renderPrompt(assembly)).not.toContain('web_search')
    expect(renderPrompt(assembly)).toContain('external, untrusted page content')

    await h.setDisabled(['web_fetch', 'web_search'])
    assembly = await h.assemble()
    expect(assembly.tools).toEqual([])
    expect(assembly.sections.filter(section => section.name.startsWith('tool:'))).toEqual([])
    await h.setDisabled([])
    expect(await h.assemble()).toEqual(original)
    await h.setDisabled(['web_fetch', 'web_search'])
    await h.fiber.dispose()
    expect(await h.assemble()).toEqual(original)
  })

  it('filters scoped, inherited, late and custom-name sections while preserving other prompt inputs', async () => {
    h = await harness()
    h.probe('write'); h.probe('read')
    h.ctx.systemPrompt.section({ name: 'tool:write', order: 1200, text: 'Write guidance' })
    h.ctx.systemPrompt.section({ name: 'tool:read', order: 1100, text: 'Read guidance' })
    h.ctx.systemPrompt.section({ name: 'custom:policy', order: 0, text: 'Policy mentioning write {{value}}' })
    h.ctx.systemPrompt.variable('value', () => 'preserved')
    h.ctx.systemPrompt.context({ name: 'sandbox:policy', order: 0, text: 'Runtime policy mentioning write' })
    const parent = h.agent('parent')
    parent.ctx.systemPrompt.section({ name: 'tool:write', order: 1200, text: 'Scoped write guidance' })
    await h.setDisabled(['write', 'delegate_custom'])
    h.probe('delegate_custom', parent.ctx)
    parent.ctx.systemPrompt.section({ name: 'tool:delegate_custom', order: 2800, text: 'Custom delegation guidance' })
    const child = h.agent('child', parent)
    const sibling = h.agent('sibling')
    // Providers running later in the waterfall must also be filtered.
    h.ctx.on('system-prompt/assemble', async (_assembly, _context, next) => {
      const assembly = await next()
      return { ...assembly, sections: [...assembly.sections, { name: 'tool:write', text: 'Late write guidance' }] }
    }, { global: true })
    for (const agent of [undefined, parent, child, sibling]) {
      const assembly = await h.assemble(agent)
      expect(assembly.sections.filter(section => section.name.startsWith('tool:')))
        .toEqual([{ name: 'tool:read', text: 'Read guidance' }])
      expect(renderPrompt(assembly)).toContain('Policy mentioning write preserved')
      expect(assembly.contexts).toEqual([{ name: 'sandbox:policy', text: 'Runtime policy mentioning write' }])
      expect(assembly.variables).toEqual({ value: 'preserved' })
    }
    await h.setDisabled([])
    expect(renderPrompt(await h.assemble(child))).toContain('Scoped write guidance')
    expect(renderPrompt(await h.assemble(child))).toContain('Custom delegation guidance')
  })

  it.each(['native', 'ptc', 'both'] as const)('keeps shared guidance only while a sibling remains available in %s', async mode => {
    h = await harness(undefined, mode)
    if (mode !== 'native') await h.ctx.plugin(WorkerRuntime)
    h.probe('job_output'); h.probe('write')
    h.ctx.systemPrompt.section({ name: 'tool:jobs', order: 1600, text: 'Shared job guidance' })
    h.ctx.systemPrompt.section({ name: 'tool:write', order: 1200, text: 'Write guidance' })
    h.ctx.systemPrompt.section({ name: 'context:file-reference', order: 900, text: 'Use read for references' })
    const parent = h.agent('parent')
    h.probe('job_list', parent.ctx)
    await h.setDisabled(['write', 'job_output', 'read'])
    expect(renderPrompt(await h.assemble())).not.toContain('Shared job guidance')
    const child = h.agent('child', parent)
    for (const agent of [parent, child]) {
      const assembly = await h.assemble(agent)
      expect(renderPrompt(assembly)).toContain('Shared job guidance')
      expect(assembly.sections.some(section => section.name === 'tool:write')).toBe(false)
      expect(assembly.sections.some(section => section.name === 'context:file-reference')).toBe(false)
      if (mode !== 'native') {
        expect(assembly.sections.find(section => section.name === 'tools:sdk')?.text).toContain('write')
      }
    }
    await h.setDisabled(['job_output', 'job_list'])
    expect(renderPrompt(await h.assemble(child))).not.toContain('Shared job guidance')
    await h.setDisabled([])
    expect(renderPrompt(await h.assemble(child))).toContain('Shared job guidance')
  })
})
