import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { Translate } from '@deepseek-ai/dsh-client-ui-slots'
import { CATALOG_PATH, type CatalogSnapshot, type ManagerSettings, type ToolCategory } from '../contracts.ts'
import { styles } from './styles.ts'
import { zh, type TextKey } from './locales.ts'

export interface ToolManagerProps {
  scope: SettingsScope<ManagerSettings>
  t: Translate<TextKey>
}

export function ToolManager({ scope, t }: ToolManagerProps) {
  const settings = useSyncExternalStore(
    useCallback(listener => scope.subscribe(listener), [scope]),
    useCallback(() => scope.getSnapshot(), [scope]),
  )
  const [catalog, setCatalog] = useState<CatalogSnapshot>()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [loadError, setLoadError] = useState(false)
  const [actionError, setActionError] = useState<TextKey>()
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const request = useRef<AbortController>()
  const mounted = useRef(false)
  const saving = useRef(false)

  const refresh = useCallback(async () => {
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    try {
      const response = await fetch(CATALOG_PATH, {
        credentials: 'same-origin', cache: 'no-store',
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const value = await response.json() as CatalogSnapshot
      if (value.apiVersion !== 1 || !Array.isArray(value.tools)) throw new Error('Incompatible catalog')
      if (mounted.current && !controller.signal.aborted) { setCatalog(value); setLoadError(false) }
    } catch {
      if (mounted.current && !controller.signal.aborted) setLoadError(true)
    } finally {
      if (request.current === controller) request.current = undefined
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    void refresh()
    const timer = window.setInterval(() => { if (!document.hidden && !request.current) void refresh() }, 5000)
    return () => { mounted.current = false; window.clearInterval(timer); request.current?.abort() }
  }, [refresh])

  const writable = settings.status === 'ready' && settings.mode === 'host' && settings.writable
  const canChange = writable && catalog !== undefined && !loadError && !busy
  const disabled = new Set(settings.value?.disabledTools ?? catalog?.disabledTools ?? [])
  const categoryKey: Record<ToolCategory, TextKey> = { shell: 'shell', files: 'files', search: 'searchGroup', other: 'other' }
  const description = (name: string) => {
    const key = `tool.${name}` as TextKey
    return Object.hasOwn(zh, key) ? t(key) : name
  }
  const filtered = (catalog?.tools ?? []).filter(tool => {
    const matchesCategory = category === 'all' || category === tool.category
    const needle = query.trim().toLocaleLowerCase()
    return matchesCategory && `${tool.name} ${description(tool.name)}`.toLocaleLowerCase().includes(needle)
  })

  const save = async (toolName?: string) => {
    if (!canChange || saving.current) return
    const current = scope.getSnapshot()
    if (current.status !== 'ready' || current.mode !== 'host' || !current.writable
      || !current.value || current.revision === undefined) return
    const next = new Set(toolName ? current.value.disabledTools : [])
    if (toolName) { if (next.has(toolName)) next.delete(toolName); else next.add(toolName) }
    saving.current = true
    setBusy(true); setSaved(false); setActionError(undefined)
    try {
      await scope.mutate([{ op: 'set', path: ['disabledTools'], value: [...next].sort() }], current.revision)
      if (mounted.current) { setSaved(true); await refresh() }
    } catch (error) {
      if (mounted.current) {
        const message = error instanceof Error ? error.message : String(error)
        setActionError(/conflict|revision/i.test(message) ? 'conflict' : 'saveFailed')
      }
    } finally { saving.current = false; if (mounted.current) setBusy(false) }
  }

  return <section className="dtm" aria-label={t('title')}>
    <style>{styles}</style>
    <h2>{t('title')}</h2>
    <p className="muted">{t('subtitle')}</p>
    <div className="scope">{t('scope')}</div>
    <div className="summary">
      <span><strong>{catalog?.tools.filter(tool => tool.loaded).length ?? '—'}</strong>{t('loaded')}</span>
      <span><strong>{settings.value ? disabled.size : '—'}</strong>{t('blocked')}</span>
    </div>
    <div className="toolbar">
      <input type="search" aria-label={t('search')} placeholder={t('search')} value={query} onChange={event => setQuery(event.target.value)} />
      <select aria-label={t('all')} value={category} onChange={event => setCategory(event.target.value)}>
        <option value="all">{t('all')}</option>
        {Object.entries(categoryKey).map(([value, key]) => <option key={value} value={value}>{t(key)}</option>)}
      </select>
      <button className="button" onClick={() => void refresh()}>{t('refresh')}</button>
    </div>
    <div className="status" role="status" aria-live="polite">{busy ? t('saving') : saved ? t('saved') : !catalog && !loadError ? t('loading') : '\u00a0'}</div>
    {loadError && <div role="alert" className="notice error">{t('loadFailed')}</div>}
    {actionError && <div role="alert" className="notice error">{t(actionError)}</div>}
    {(settings.status === 'unavailable' || (settings.status === 'ready' && !writable)) && <div className="notice">{t('readOnly')}</div>}
    {catalog?.sessionCount === 0 && <div className="notice">{t('noSessions')}</div>}
    {!!catalog?.codeSessionCount && <div className="notice">{t('codeLimit')}</div>}
    <div className="list">
      {filtered.map(tool => <div className="row" key={tool.name}>
        <div className="tool">
          <div className="name"><code>{tool.name}</code><span className="badge">{t(categoryKey[tool.category])}</span></div>
          <div className="description">{description(tool.name)}</div>
          <div className={`row-state ${disabled.has(tool.name) ? 'blocked' : ''}`}>
            {disabled.has(tool.name) ? t('blocked') : tool.loaded ? t('available') : t('unloaded')}
            {!tool.loaded && disabled.has(tool.name) ? ` · ${t('unloaded')}` : ''}
          </div>
          {tool.description && <details className="tool-details"><summary>{t('details')}</summary><p>{tool.description}</p></details>}
        </div>
        <div className="switch-area">
          <span>{disabled.has(tool.name) ? t('disabled') : t('enabled')}</span>
          <button className="switch" role="switch" type="button" aria-label={tool.name}
            aria-checked={!disabled.has(tool.name)} disabled={!canChange}
            title={!tool.loaded ? t('pending') : undefined} onClick={() => void save(tool.name)}>
            <span className="switch-knob" />
          </button>
        </div>
      </div>)}
      {catalog && filtered.length === 0 && <div className="empty">{t('empty')}</div>}
    </div>
    <div className="footer">
      <span className="muted">{catalog ? `v${catalog.pluginVersion}` : ''}</span>
      <button className="button" disabled={!canChange || disabled.size === 0} onClick={() => void save()}>{t('reset')}</button>
    </div>
    <details className="help"><summary>{t('notes')}</summary><p>{t('timing')}</p><p>{t('boundary')}</p></details>
  </section>
}
