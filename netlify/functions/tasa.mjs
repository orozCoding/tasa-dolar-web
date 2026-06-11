import { getStore } from '@netlify/blobs'

// Server-side proxy for the public /tasa page.
//
// Why this exists: a static SPA that called the backend directly would leak the
// API URL and let anyone scrape it freely. Routing through this function lets us
// (1) hide the backend, (2) only ever expose the minimal brecha payload, and
// (3) gate access: same-origin only, no obvious bots, and per-IP rate limiting.
//
// A public page can never be 100% unscrapable, but this raises the cost enough
// that casual scraping and indexing stop being practical — while a real browser
// on tasadolar.com is unaffected.

const BACKEND_URL = 'https://tasa-dolar-api-58e5e9d2d0fe.herokuapp.com/api/v1/brecha'

const WINDOW_MS = 60_000 // 1 minute
const MAX_HITS = 20 // per IP per window — far above what a real viewer needs

const ALLOWED_HOST_SUFFIXES = ['tasadolar.com', 'netlify.app', 'localhost', '127.0.0.1']

// Obvious automation / HTTP clients. Real browser UAs ("Mozilla/5.0 ... Chrome ...")
// don't contain any of these tokens, so legitimate visitors pass through.
const BLOCKED_UA =
  /(bot|crawl|spider|scrape|scrapy|curl|wget|python|perl|ruby|java(?!script)|go-http|libwww|okhttp|node-fetch|axios|httpclient|httpx|aiohttp|headless|phantom|puppeteer|playwright|selenium|postman|insomnia|dataprovider|semrush|ahrefs)/i

const SECURITY_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store, max-age=0',
  'x-robots-tag': 'noindex, nofollow',
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
}

function reply(body, status) {
  return new Response(JSON.stringify(body), { status, headers: SECURITY_HEADERS })
}

function hostAllowed(value) {
  if (!value) return false
  try {
    const host = new URL(value).hostname
    return ALLOWED_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`))
  } catch {
    return false
  }
}

async function isRateLimited(ip) {
  try {
    const store = getStore('tasa-ratelimit')
    const key = ip.replace(/[^a-zA-Z0-9_.:-]/g, '_')
    const now = Date.now()
    const previous = (await store.get(key, { type: 'json' })) || { hits: [] }
    const hits = previous.hits.filter((t) => now - t < WINDOW_MS)
    hits.push(now)
    await store.setJSON(key, { hits })
    return hits.length > MAX_HITS
  } catch {
    // Never block a real user because the limiter backend hiccuped.
    return false
  }
}

export default async (req, context) => {
  if (req.method !== 'GET') return reply({ error: 'Method not allowed' }, 405)

  // 1) Same-origin only. A browser fetch from our own page sends
  //    Sec-Fetch-Site: same-origin (and a tasadolar.com referer); a direct curl
  //    or a cross-site embed does not.
  const secFetchSite = req.headers.get('sec-fetch-site')
  const sameOrigin =
    secFetchSite === 'same-origin' ||
    hostAllowed(req.headers.get('origin')) ||
    hostAllowed(req.headers.get('referer'))
  if (!sameOrigin) return reply({ error: 'Forbidden' }, 403)

  // 2) Block obvious automation.
  const ua = req.headers.get('user-agent') || ''
  if (!ua || BLOCKED_UA.test(ua)) return reply({ error: 'Forbidden' }, 403)

  // 3) Per-IP rate limit.
  const ip =
    context?.ip ||
    req.headers.get('x-nf-client-connection-ip') ||
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown'
  if (await isRateLimited(ip)) {
    return reply({ error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' }, 429)
  }

  // 4) Proxy to the hidden backend and pass through only its minimal payload.
  try {
    const upstream = await fetch(BACKEND_URL, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
    if (!upstream.ok) return reply({ error: 'Servicio no disponible' }, 502)
    const data = await upstream.json()
    return reply(data, 200)
  } catch {
    return reply({ error: 'Servicio no disponible' }, 503)
  }
}

// Exposed to the page at /api/tasa via a rewrite in public/_redirects, which is
// ordered before the SPA catch-all so it can't be shadowed.
