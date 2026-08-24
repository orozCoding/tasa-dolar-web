import { request as httpsRequest } from 'node:https'
import tls from 'node:tls'
import { getStore } from '@netlify/blobs'

// Server-side proxy for the public landing page's rate strip.
//
// Unlike /api/tasa (which proxies our own backend), this fetches straight from
// the original public sources — BCV's own page and Binance P2P — the same
// sources tasa-dolar-api scrapes, so the landing page never depends on or
// reveals our backend. Same protections as tasa.mjs: same-origin only, no
// obvious bots, per-IP rate limiting, and a short server-side cache so a burst
// of visitors doesn't hammer BCV or Binance.

const BCV_URL = 'https://www.bcv.org.ve/glosario/cambio-oficial'
const BINANCE_URL = 'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search'

// bcv.org.ve's server sends the wrong intermediate certificate for its
// current leaf cert (a real misconfiguration on their end, confirmed via
// openssl — the leaf is issued by "Sectigo Public Server Authentication CA DV
// R36" but the server serves the older "Sectigo RSA Domain Validation Secure
// Server CA" instead). Browsers tolerate this via online AIA chasing; Node's
// TLS stack does not, so plain fetch()/https fails with
// UNABLE_TO_VERIFY_LEAF_SIGNATURE. We supply the correct intermediate
// ourselves (fetched from Sectigo's own CA-issuers URL) alongside the default
// trusted roots, restoring real verification without disabling it.
const BCV_MISSING_INTERMEDIATE = `-----BEGIN CERTIFICATE-----
MIIGTDCCBDSgAwIBAgIQOXpmzCdWNi4NqofKbqvjsTANBgkqhkiG9w0BAQwFADBf
MQswCQYDVQQGEwJHQjEYMBYGA1UEChMPU2VjdGlnbyBMaW1pdGVkMTYwNAYDVQQD
Ey1TZWN0aWdvIFB1YmxpYyBTZXJ2ZXIgQXV0aGVudGljYXRpb24gUm9vdCBSNDYw
HhcNMjEwMzIyMDAwMDAwWhcNMzYwMzIxMjM1OTU5WjBgMQswCQYDVQQGEwJHQjEY
MBYGA1UEChMPU2VjdGlnbyBMaW1pdGVkMTcwNQYDVQQDEy5TZWN0aWdvIFB1Ymxp
YyBTZXJ2ZXIgQXV0aGVudGljYXRpb24gQ0EgRFYgUjM2MIIBojANBgkqhkiG9w0B
AQEFAAOCAY8AMIIBigKCAYEAljZf2HIz7+SPUPQCQObZYcrxLTHYdf1ZtMRe7Yeq
RPSwygz16qJ9cAWtWNTcuICc++p8Dct7zNGxCpqmEtqifO7NvuB5dEVexXn9RFFH
12Hm+NtPRQgXIFjx6MSJcNWuVO3XGE57L1mHlcQYj+g4hny90aFh2SCZCDEVkAja
EMMfYPKuCjHuuF+bzHFb/9gV8P9+ekcHENF2nR1efGWSKwnfG5RawlkaQDpRtZTm
M64TIsv/r7cyFO4nSjs1jLdXYdz5q3a4L0NoabZfbdxVb+CUEHfB0bpulZQtH1Rv
38e/lIdP7OTTIlZh6OYL6NhxP8So0/sht/4J9mqIGxRFc0/pC8suja+wcIUna0HB
pXKfXTKpzgis+zmXDL06ASJf5E4A2/m+Hp6b84sfPAwQ766rI65mh50S0Di9E3Pn
2WcaJc+PILsBmYpgtmgWTR9eV9otfKRUBfzHUHcVgarub/XluEpRlTtZudU5xbFN
xx/DgMrXLUAPaI60fZ6wA+PTAgMBAAGjggGBMIIBfTAfBgNVHSMEGDAWgBRWc1hk
lfmSGrASKgRieaFAFYghSTAdBgNVHQ4EFgQUaMASFhgOr872h6YyV6NGUV3LBycw
DgYDVR0PAQH/BAQDAgGGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0lBBYwFAYI
KwYBBQUHAwEGCCsGAQUFBwMCMBsGA1UdIAQUMBIwBgYEVR0gADAIBgZngQwBAgEw
VAYDVR0fBE0wSzBJoEegRYZDaHR0cDovL2NybC5zZWN0aWdvLmNvbS9TZWN0aWdv
UHVibGljU2VydmVyQXV0aGVudGljYXRpb25Sb290UjQ2LmNybDCBhAYIKwYBBQUH
AQEEeDB2ME8GCCsGAQUFBzAChkNodHRwOi8vY3J0LnNlY3RpZ28uY29tL1NlY3Rp
Z29QdWJsaWNTZXJ2ZXJBdXRoZW50aWNhdGlvblJvb3RSNDYucDdjMCMGCCsGAQUF
BzABhhdodHRwOi8vb2NzcC5zZWN0aWdvLmNvbTANBgkqhkiG9w0BAQwFAAOCAgEA
YtOC9Fy+TqECFw40IospI92kLGgoSZGPOSQXMBqmsGWZUQ7rux7cj1du6d9rD6C8
ze1B2eQjkrGkIL/OF1s7vSmgYVafsRoZd/IHUrkoQvX8FZwUsmPu7amgBfaY3g+d
q1x0jNGKb6I6Bzdl6LgMD9qxp+3i7GQOnd9J8LFSietY6Z4jUBzVoOoz8iAU84OF
h2HhAuiPw1ai0VnY38RTI+8kepGWVfGxfBWzwH9uIjeooIeaosVFvE8cmYUB4TSH
5dUyD0jHct2+8ceKEtIoFU/FfHq/mDaVnvcDCZXtIgitdMFQdMZaVehmObyhRdDD
4NQCs0gaI9AAgFj4L9QtkARzhQLNyRf87Kln+YU0lgCGr9HLg3rGO8q+Y4ppLsOd
unQZ6ZxPNGIfOApbPVf5hCe58EZwiWdHIMn9lPP6+F404y8NNugbQixBber+x536
WrZhFZLjEkhp7fFXf9r32rNPfb74X/U90Bdy4lzp3+X1ukh1BuMxA/EEhDoTOS3l
7ABvc7BYSQubQ2490OcdkIzUh3ZwDrakMVrbaTxUM2p24N6dB+ns2zptWCva6jzW
r8IWKIMxzxLPv5Kt3ePKcUdvkBU/smqujSczTzzSjIoR5QqQA6lN1ZRSnuHIWCvh
JEltkYnTAH41QJ6SAWO66GrrUESwN/cgZzL4JLEqz1Y=
-----END CERTIFICATE-----`

const WINDOW_MS = 60_000 // 1 minute
const MAX_HITS = 20 // per IP per window — far above what a real viewer needs
const CACHE_TTL_MS = 90_000 // re-fetch upstream at most once every 90s

const ALLOWED_HOST_SUFFIXES = ['tasadolar.com', 'netlify.app', 'localhost', '127.0.0.1']

const BLOCKED_UA =
  /(bot|crawl|spider|scrape|scrapy|curl|wget|python|perl|ruby|java(?!script)|go-http|libwww|okhttp|node-fetch|axios|httpclient|httpx|aiohttp|headless|phantom|puppeteer|playwright|selenium|postman|insomnia|dataprovider|semrush|ahrefs)/i

const SECURITY_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'public, max-age=60, stale-while-revalidate=120',
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
    const store = getStore('landing-rates-ratelimit')
    const key = ip.replace(/[^a-zA-Z0-9_.:-]/g, '_')
    const now = Date.now()
    const previous = (await store.get(key, { type: 'json' })) || { hits: [] }
    const hits = previous.hits.filter((t) => now - t < WINDOW_MS)
    hits.push(now)
    await store.setJSON(key, { hits })
    return hits.length > MAX_HITS
  } catch {
    return false
  }
}

// price string looks like "784,66330000" (comma decimal, no thousands dot at
// this magnitude) — normalize to a plain float.
function parseBcvNumber(raw) {
  const n = Number(String(raw).trim().replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null
}

function extractStrongAfterId(html, id) {
  const idIdx = html.indexOf(`id="${id}"`)
  if (idIdx === -1) return null
  const match = html.slice(idIdx).match(/<strong[^>]*>\s*([\d.,]+)\s*<\/strong>/)
  return match ? parseBcvNumber(match[1]) : null
}

function fetchBcvHtml() {
  return new Promise((resolve, reject) => {
    const req = httpsRequest(
      BCV_URL,
      {
        method: 'GET',
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
          accept: 'text/html',
        },
        ca: [...tls.rootCertificates, BCV_MISSING_INTERMEDIATE],
        timeout: 9000,
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          res.resume()
          reject(new Error(`BCV responded ${res.statusCode}`))
          return
        }
        let data = ''
        res.setEncoding('utf8')
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => resolve(data))
      }
    )
    req.on('timeout', () => req.destroy(new Error('BCV request timed out')))
    req.on('error', reject)
    req.end()
  })
}

async function fetchBcv() {
  const html = await fetchBcvHtml()

  const dolar = extractStrongAfterId(html, 'dolar')
  const euro = extractStrongAfterId(html, 'euro')
  const dateMatch = html.match(/date-display-single"[^>]*content="([^"]+)"/)
  const date = dateMatch ? dateMatch[1].slice(0, 10) : null // YYYY-MM-DD

  return { dolar, euro, date }
}

async function fetchBinanceSide(tradeType) {
  const res = await fetch(BINANCE_URL, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
      'user-agent': 'Mozilla/5.0',
    },
    body: JSON.stringify({
      asset: 'USDT',
      fiat: 'VES',
      tradeType,
      publisherType: 'merchant',
      rows: 20,
      page: 1,
    }),
    signal: AbortSignal.timeout(9000),
  })
  if (!res.ok) return null
  const json = await res.json()
  const prices = (json.data || [])
    .map((ad) => Number.parseFloat(ad?.adv?.price))
    .filter((n) => Number.isFinite(n))
  if (!prices.length) return null
  return prices.reduce((a, b) => a + b, 0) / prices.length
}

async function fetchBinanceUsdt() {
  const [buyAvg, sellAvg] = await Promise.all([fetchBinanceSide('BUY'), fetchBinanceSide('SELL')])
  if (buyAvg == null && sellAvg == null) return null
  const avg = buyAvg != null && sellAvg != null ? (buyAvg + sellAvg) / 2 : (buyAvg ?? sellAvg)
  return Math.round(avg * 100) / 100
}

// Tracks the previous *official* price per rate so % change reflects a real
// day-over-day move, not noise between two requests seconds apart. The
// baseline only shifts when BCV actually publishes a new date — mirroring how
// tasa-dolar-api captures old_price_cents right before a new rate is created.
async function withDayChange(key, price, dateKey) {
  if (price == null) return { price: null, change: null }
  try {
    const store = getStore('landing-rates-history')
    const prev = await store.get(key, { type: 'json' })

    let prevPrice = prev?.prevPrice ?? price
    if (!prev || prev.dateKey !== dateKey) {
      prevPrice = prev?.price ?? price
    }

    await store.setJSON(key, { price, dateKey, prevPrice })

    const change = prevPrice ? ((price - prevPrice) / prevPrice) * 100 : 0
    return { price, change: Math.round(change * 100) / 100 }
  } catch {
    return { price, change: null }
  }
}

async function buildPayload() {
  const [bcv, binanceUsdt] = await Promise.all([fetchBcv().catch(() => null), fetchBinanceUsdt().catch(() => null)])

  const dolarDateKey = bcv?.date ?? null
  const [dolar, euro] = await Promise.all([
    withDayChange('bcv_dolar', bcv?.dolar ?? null, dolarDateKey),
    withDayChange('bcv_euro', bcv?.euro ?? null, dolarDateKey),
  ])

  return {
    bcv_dolar: dolar,
    bcv_euro: euro,
    binance_usdt: { price: binanceUsdt, change: null }, // continuous market, no clean "daily" boundary
    fetchedAt: new Date().toISOString(),
  }
}

export default async (req, context) => {
  if (req.method !== 'GET') return reply({ error: 'Method not allowed' }, 405)

  const secFetchSite = req.headers.get('sec-fetch-site')
  const sameOrigin =
    secFetchSite === 'same-origin' ||
    hostAllowed(req.headers.get('origin')) ||
    hostAllowed(req.headers.get('referer'))
  if (!sameOrigin) return reply({ error: 'Forbidden' }, 403)

  const ua = req.headers.get('user-agent') || ''
  if (!ua || BLOCKED_UA.test(ua)) return reply({ error: 'Forbidden' }, 403)

  const ip =
    context?.ip ||
    req.headers.get('x-nf-client-connection-ip') ||
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown'
  if (await isRateLimited(ip)) {
    return reply({ error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' }, 429)
  }

  // The cache is a nice-to-have (protects BCV/Binance from bursts of
  // traffic) — never let it being unavailable take the whole endpoint down.
  try {
    const cacheStore = getStore('landing-rates-cache')
    const cached = await cacheStore.get('payload', { type: 'json' })
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return reply(cached.payload, 200)
    }
  } catch {
    // Fall through to a live fetch.
  }

  try {
    const payload = await buildPayload()
    try {
      const cacheStore = getStore('landing-rates-cache')
      await cacheStore.setJSON('payload', { payload, cachedAt: Date.now() })
    } catch {
      // Best-effort write; a miss just means the next request re-fetches.
    }
    return reply(payload, 200)
  } catch {
    return reply({ error: 'Servicio no disponible' }, 503)
  }
}

// Exposed to the page at /api/rates via a rewrite in public/_redirects, which
// is ordered before the SPA catch-all so it can't be shadowed.
