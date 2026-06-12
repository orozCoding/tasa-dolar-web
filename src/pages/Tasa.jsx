import { useEffect, useState, useCallback } from 'react'
import CountUp from 'react-countup'
import logo from '/logo.png'
import themeSwitchIcon from '/theme-switch.svg'
import themeSwitchIconWhite from '/theme-switch-white.svg'

const REFRESH_MS = 90_000

const nf = new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatBs = (n) => (n == null ? '—' : nf.format(n))

function Tasa() {
  const [darkMode, setDarkMode] = useState(false)
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ok | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Keep this page out of search indexes (belt-and-suspenders with the X-Robots-Tag header).
  useEffect(() => {
    const prevTitle = document.title
    document.title = 'Brecha del dólar | Tasa Dolar Venezuela'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => {
      document.title = prevTitle
      document.head.removeChild(meta)
    }
  }, [])

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/tasa', { headers: { accept: 'application/json' } })
      if (res.status === 429) {
        setStatus('error')
        setMessage('Demasiadas solicitudes. Espera un momento e intenta de nuevo.')
        return
      }
      if (!res.ok) throw new Error('bad status')
      const json = await res.json()
      setData(json)
      setStatus('ok')
    } catch {
      setStatus('error')
      setMessage('No pudimos cargar la tasa. Intenta de nuevo en un momento.')
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => clearInterval(id)
  }, [load])

  return (
    <div className="min-h-screen w-full px-3 py-10 text-black dark:text-white flex flex-col items-center gap-8 relative">
      <img
        className="w-10 rounded-md absolute top-4 left-4 cursor-pointer"
        src={darkMode ? themeSwitchIconWhite : themeSwitchIcon}
        onClick={() => setDarkMode(!darkMode)}
        alt="Cambiar tema"
      />

      <div className="flex flex-col items-center gap-3">
        <img className="w-16 rounded-md" src={logo} alt="Tasa Dolar Venezuela" />
        <h1 className="text-3xl font-bold text-center">Brecha del dólar</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
          Diferencia entre la tasa oficial (BCV) y el dólar paralelo (Binance USDT).
        </p>
      </div>

      {status === 'loading' && (
        <div className="animate-pulse text-gray-400 mt-10">Cargando tasa…</div>
      )}

      {status === 'error' && (
        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-red-500 text-center max-w-sm">{message}</p>
          <button
            onClick={load}
            className="rounded-lg border border-gray-400 dark:border-gray-600 px-5 py-2 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {status === 'ok' && data?.brecha && <Brecha data={data} />}
    </div>
  )
}

function Brecha({ data }) {
  const [copied, setCopied] = useState(false)
  const percent = data.brecha.percent
  const history = Array.isArray(data.history) ? data.history : []
  const maxPercent = history.reduce((m, h) => Math.max(m, Math.abs(h.percent)), 0)

  const shareText = [
    '💵 Brecha cambiaria',
    '',
    `🏛️ BCV oficial: Bs. ${formatBs(data.bcv?.price)}`,
    `📈 Paralelo USDT: Bs. ${formatBs(data.binance_usdt?.price)}`,
    '',
    `📊 Brecha: ${formatBs(percent)}%`,
    '',
    'tasadolar.com',
  ].join('\n')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = shareText
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
      } finally {
        document.body.removeChild(ta)
      }
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <section className="w-full max-w-2xl flex flex-col gap-6">
      {/* Rates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RateCard
          label="BCV · Oficial"
          accent="border-l-red-600"
          labelColor="text-red-600"
          price={data.bcv?.price}
          date={data.bcv?.date}
        />
        <RateCard
          label="Binance USDT · Paralelo"
          accent="border-l-yellow-500"
          labelColor="text-yellow-600 dark:text-yellow-500"
          price={data.binance_usdt?.price}
          date={data.binance_usdt?.date}
        />
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-black p-8 shadow-xl">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="relative flex flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
            Brecha cambiaria
          </span>
          <div className="mt-3 text-7xl font-black leading-none bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
            <CountUp end={percent} decimals={2} duration={1.1} decimal="," separator="." suffix="%" />
          </div>
          <p className="mt-3 max-w-md text-sm text-gray-500 dark:text-gray-400">
            El USDT Binance está{' '}
            <span className="font-semibold text-black dark:text-white">{formatBs(percent)}%</span> por
            encima de la tasa oficial del BCV.
          </p>
        </div>
      </div>

      {/* Share */}
      <div className="flex justify-center">
        <button
          onClick={copy}
          className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white transition-colors ${
            copied ? 'bg-green-600' : 'bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600'
          }`}
        >
          {copied ? '¡Copiado!' : 'Copiar para compartir'}
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Brecha · últimos días
          </h2>
          <div className="flex flex-col gap-3">
            {[...history].reverse().map((h) => {
              const width = maxPercent === 0 ? 0 : Math.round((Math.abs(h.percent) / maxPercent) * 100)
              return (
                <div key={h.date} className="flex items-center gap-3">
                  <span className="w-12 shrink-0 text-xs text-gray-400">{formatDay(h.date)}</span>
                  <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-gray-200 dark:bg-gray-800">
                    <div
                      className="h-full rounded-md bg-gradient-to-r from-red-500 to-yellow-400"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-sm font-semibold">
                    {formatBs(h.percent)}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <p className="text-center text-[11px] text-gray-400">
        Actualizado: {data.bcv?.date} · BCV vs Binance USDT
      </p>
    </section>
  )
}

function RateCard({ label, accent, labelColor, price, date }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 dark:border-gray-800 border-l-4 ${accent} bg-white/60 dark:bg-gray-900/60 p-5`}
    >
      <span className={`text-xs font-semibold uppercase tracking-widest ${labelColor}`}>{label}</span>
      <div className="mt-2 text-2xl font-bold">Bs. {formatBs(price)}</div>
      <div className="mt-1 text-xs text-gray-400">{date}</div>
    </div>
  )
}

// "2026-06-11" -> "11/06"
function formatDay(isoDate) {
  if (!isoDate) return ''
  const parts = String(isoDate).split('-')
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : isoDate
}

export default Tasa
