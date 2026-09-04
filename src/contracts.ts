export const NAMESPACE = 'dsh-tool-manager'
export const CATALOG_PATH = '/tool-manager/api/catalog'

export interface ManagerSettings {
  schemaVersion: 1
  disabledTools: string[]
}

export type ToolCategory = 'shell' | 'files' | 'search' | 'other'

export interface ToolRow {
  name: string
  category: ToolCategory
  description: string
  loaded: boolean
  sessionCount: number
}

export interface CatalogSnapshot {
  apiVersion: 1
  pluginVersion: string
  revision: number
  settingsRevision: number
  disabledTools: string[]
  sessionCount: number
  codeSessionCount: number
  tools: ToolRow[]
}

export const BUILTIN_TOOLS: Record<string, ToolCategory> = {
  pwsh: 'shell', bash: 'shell',
  read: 'files', read_image: 'files', write: 'files', edit: 'files',
  str_replace_editor: 'files', glob: 'search', grep: 'search',
}

/** This validates persisted input too; transport names are not capabilities. */
export function isManageableToolName(name: string): boolean {
  return /^[A-Za-z0-9_-]{1,128}$/.test(name) && name !== 'run_code'
}

export function validateSettings(value: ManagerSettings): void {
  if (value.schemaVersion !== 1 || !Array.isArray(value.disabledTools)
    || value.disabledTools.length > 256) throw new Error('Invalid tool manager settings')
  const seen = new Set<string>()
  for (const name of value.disabledTools) {
    if (typeof name !== 'string' || !isManageableToolName(name) || seen.has(name)) {
      throw new Error(`Invalid or duplicate tool name: ${String(name)}`)
    }
    seen.add(name)
  }
}
