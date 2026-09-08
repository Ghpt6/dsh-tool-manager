import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-settings'
import type {} from '@deepseek-ai/dsh-host-webserver'
import { CATALOG_PATH, NAMESPACE, validateSettings, type ManagerSettings, type CatalogSnapshot } from './contracts.ts'
import { readCatalog } from './catalog.ts'
import { denialReason, filterPrompt } from './policy.ts'
import { catalogHandler } from './http.ts'

declare const __PLUGIN_VERSION__: string
export const name = 'tool-manager'
export const inject = ['tools', 'systemPrompt', 'settings', 'agents']
export type Config = ManagerSettings
export const Config: z<ManagerSettings> = z.object({
  schemaVersion: z.const(1).default(1),
  disabledTools: z.array(z.string()).default([]),
})

export function apply(ctx: Context, config: Config): void {
  if (typeof ctx.tools.guard !== 'function' || typeof ctx.tools.schemas !== 'function') {
    throw new Error('Tool Manager requires DSH 0.1.2-rc.1 tools.guard and tools.schemas.')
  }
  const settings = ctx.settings.register(NAMESPACE, Config, { base: config, validate: validateSettings })
  // Read the committed snapshot at the check itself; watchers run asynchronously.
  ctx.tools.guard(exec => denialReason(settings.get(), exec.name))
  ctx.on('system-prompt/assemble', async (_assembly, context, next) => {
    return filterPrompt(await next(), settings.get(), ctx.tools.schemas(context.scope).map(tool => tool.name))
  }, { prepend: true, global: true })

  let revision = 0
  const invalidate = () => { revision++ }
  ctx.on('tools/change', invalidate)
  ctx.on('agent/created', invalidate, { global: true })
  ctx.on('agent/disposed', invalidate, { global: true })
  settings.watch(() => {
    invalidate()
    ctx.emit('system-prompt/change')
  })

  ctx.inject(['webServer'], webCtx => {
    const snapshot = (): CatalogSnapshot => {
      const disabledTools = [...settings.get().disabledTools]
      const settingsRevision = ctx.settings.describe().find(section => section.ns === NAMESPACE)?.revision ?? 0
      return {
        apiVersion: 1,
        pluginVersion: typeof __PLUGIN_VERSION__ === 'undefined' ? 'development' : __PLUGIN_VERSION__,
        revision, settingsRevision, disabledTools,
        ...readCatalog(ctx, disabledTools),
      }
    }
    webCtx.webServer.register({
      kind: 'exact', path: CATALOG_PATH,
      handler: catalogHandler(snapshot, () => webCtx.webServer.port),
    })
  })
}
