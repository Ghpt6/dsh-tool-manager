import type { ManagerSettings } from './contracts.ts'
import type { PromptAssembly } from '@deepseek-ai/dsh-system-prompt'

export function denialReason(settings: ManagerSettings, name: string): string | undefined {
  return settings.disabledTools.includes(name)
    ? `Tool "${name}" is disabled in Tool Manager. Enable it in Settings → Tool Manager to use it.`
    : undefined
}

// Shared/aliased section ownership in DSH 0.1.2-rc.1. Other tool sections
// follow tool:<registered name>, including configurable subagent/workflow names.
const SECTION_TOOLS = new Map<string, readonly string[]>([
  ['tool:jobs', ['job_output', 'job_list', 'job_kill']],
  ['tool:goal', ['get_goal', 'create_goal', 'update_goal']],
  ['tool:pty', ['terminal_open', 'terminal_send', 'terminal_read', 'terminal_signal', 'terminal_close', 'terminal_list']],
  ['tool:session-query', ['session_search', 'session_event_search', 'session_trace', 'session_event_trace', 'session_event_read']],
  ['tool:cordis', ['cordis_inspect_list', 'cordis_inspect_query', 'cordis_inspect_self', 'cordis_define', 'cordis_run', 'cordis_stop', 'cordis_undefine']],
  ['context:file-reference', ['read']],
])

/** Filter owned guidance, preserving unrelated policy/context and the Code/PTC SDK. */
export function filterPrompt(
  assembly: PromptAssembly,
  settings: ManagerSettings,
  registeredNames: readonly string[] = assembly.tools.map(tool => tool.name),
): PromptAssembly {
  const disabled = new Set(settings.disabledTools)
  const available = new Set(registeredNames.filter(name => !disabled.has(name)))
  const sections = assembly.sections.filter(section => {
    const owners = SECTION_TOOLS.get(section.name)
    if (owners) {
      // A sibling still in use needs the shared guidance. Use registry names,
      // since PTC assemblies expose only run_code in their wire tool list.
      return !owners.some(name => disabled.has(name)) || owners.some(name => available.has(name))
    }
    return !section.name.startsWith('tool:') || !disabled.has(section.name.slice('tool:'.length))
  }).map(section => {
    // The web suite captures its sibling's enablement at registration time.
    // Adapt only its known cross-tool wording, keeping trust/citation guidance.
    if (section.name === 'tool:web_search' && disabled.has('web_fetch')) {
      return { ...section, text: section.text.replace(
        'Follow up with web_fetch when you need the full content of a specific result, and cite the relevant URLs as markdown links.',
        'Use the returned source snippets when available, and cite the relevant URLs as markdown links.',
      ) }
    }
    if (section.name === 'tool:web_fetch' && disabled.has('web_search')) {
      return { ...section, text: section.text.replace(' (for example a result from web_search)', '') }
    }
    return section
  })
  return { ...assembly, sections, tools: assembly.tools.filter(tool => !disabled.has(tool.name)) }
}
