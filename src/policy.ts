import type { ManagerSettings } from './contracts.ts'
import type { PromptAssembly } from '@deepseek-ai/dsh-system-prompt'

export function denialReason(settings: ManagerSettings, name: string): string | undefined {
  return settings.disabledTools.includes(name)
    ? `Tool "${name}" is disabled in Tool Manager. Enable it in Settings → Tool Manager to use it.`
    : undefined
}

/** Preserve sections and history, including the Code/PTC SDK (documented limit). */
export function filterPrompt(assembly: PromptAssembly, settings: ManagerSettings): PromptAssembly {
  const disabled = new Set(settings.disabledTools)
  return { ...assembly, tools: assembly.tools.filter(tool => !disabled.has(tool.name)) }
}
