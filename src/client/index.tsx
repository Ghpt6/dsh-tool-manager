import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { NAMESPACE, type ManagerSettings } from '../contracts.ts'
import { ToolManager } from './ToolManager.tsx'
import { en, zh, type TextKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap { 'dsh-tool-manager': TextKey }
}

export const inject = ['slots', 'locale', 'settingsScope']

export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NAMESPACE, { zh, en }), 'tool-manager.locales')
  const scope = ctx.settingsScope.bind<ManagerSettings>({ namespace: NAMESPACE })
  const t = ctx.locale.bind(NAMESPACE)
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section', id: NAMESPACE, order: 17,
    label: () => t('title'), locale: NAMESPACE,
    inject: () => ({ scope }),
  }, ToolManager))
}
