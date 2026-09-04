import type { IncomingMessage, ServerResponse } from 'node:http'
import type { CatalogSnapshot } from './contracts.ts'

function loopback(address: string | undefined): boolean {
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
}

/** Custom routes do not inherit the RPC carrier's checks. This route is local/read-only. */
export function catalogHandler(snapshot: () => CatalogSnapshot, port: () => number) {
  return (req: IncomingMessage, res: ServerResponse): void => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    const send = (status: number, data: unknown) => { res.statusCode = status; res.end(JSON.stringify(data)) }
    const allowedHosts = new Set([`127.0.0.1:${port()}`, `localhost:${port()}`, `[::1]:${port()}`])
    const origin = req.headers.origin
    if (!loopback(req.socket.remoteAddress) || !allowedHosts.has(req.headers.host ?? '')
      || req.headers['sec-fetch-site'] === 'cross-site'
      || (origin !== undefined && origin !== `http://${req.headers.host}`)) {
      send(403, { error: 'Tool Manager is available from the local DSH page only.' })
      return
    }
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET')
      send(405, { error: 'Method not allowed' })
      return
    }
    try { send(200, snapshot()) } catch { send(503, { error: 'Tool catalog is unavailable. Refresh after the runtime is ready.' }) }
  }
}
