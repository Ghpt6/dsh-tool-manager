import { afterEach, describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'
import { get } from 'node:http'
import { join } from 'node:path'
import { harness, type Harness } from './helpers.ts'
import { NAMESPACE } from '../src/contracts.ts'

let h: Harness | undefined
afterEach(async () => { await h?.close(); h = undefined })

describe('file-backed settings and catalog', () => {
  it('persists on restart and preserves disabled tools which are not loaded', async () => {
    h = await harness()
    await h.setDisabled(['pwsh', 'write', 'constructor'])
    const dir = h.dir
    const file = JSON.parse(await readFile(join(dir, 'settings.json'), 'utf8'))
    expect(file[NAMESPACE].disabledTools).toEqual(['pwsh', 'write', 'constructor'])
    await h.close(false)
    h = await harness(dir)
    h.probe('write')
    expect((await h.execute('write')).isError).toBe(true)
    const origin = await h.serve()
    const snapshot = await (await fetch(`${origin}/tool-manager/api/catalog`)).json()
    expect(snapshot.disabledTools).toEqual(['pwsh', 'write', 'constructor'])
    expect(snapshot.tools.find((row: { name: string }) => row.name === 'pwsh')).toMatchObject({ loaded: false })
    expect(snapshot.tools.find((row: { name: string }) => row.name === 'constructor')).toMatchObject({ loaded: false, category: 'other' })
  })

  it('rejects stale writes and invalid tool names without weakening the current policy', async () => {
    h = await harness()
    const initial = h.ctx.settings.describe().find(section => section.ns === NAMESPACE)!.revision
    await h.setDisabled(['write'])
    await expect(h.ctx.settings.mutate(NAMESPACE, [{ op: 'set', path: ['disabledTools'], value: [] }], initial)).rejects.toThrow()
    for (const names of [['run_code'], ['write', 'write'], ['*'], ['bad name']]) {
      await expect(h.setDisabled(names)).rejects.toThrow()
    }
    expect(h.ctx.settings.describe().find(section => section.ns === NAMESPACE)!.value).toMatchObject({ disabledTools: ['write'] })
  })

  it('keeps catalog read-only and rejects cross-origin/DNS-rebinding requests', async () => {
    h = await harness()
    const origin = await h.serve()
    const url = `${origin}/tool-manager/api/catalog`
    expect((await fetch(url)).status).toBe(200)
    expect((await fetch(url, { method: 'POST' })).status).toBe(405)
    expect((await fetch(url, { headers: { origin: 'https://example.com' } })).status).toBe(403)
    expect((await fetch(url, { headers: { 'sec-fetch-site': 'cross-site' } })).status).toBe(403)
    const reboundStatus = await new Promise<number | undefined>((resolve, reject) => {
      get(url, { headers: { host: `untrusted.example:${new URL(origin).port}` } }, response => {
        response.resume()
        resolve(response.statusCode)
      }).on('error', reject)
    })
    expect(reboundStatus).toBe(403)
  })
})
