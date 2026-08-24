import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CountUp from 'react-countup'
import playBanner from '/play_store_banner.png'
import appBanner from '/app_store_banner.svg'
import logo from '/logo.png'
import urls from '../constants/urls'
import { FEATURES, FeatureTabs, PhoneImage } from '../components/PhoneShowcase'

const AUTOPLAY_MS = 3000
const RATES_POLL_MS = 120_000

// Shown instantly on load (and if /api/rates is ever unreachable) so the
// strip never looks empty or broken — replaced by live values as soon as
// they load.
const FALLBACK_RATES = [
  { key: 'bcv_dolar', label: 'DÓLAR BCV', value: 'Bs. 784,66', change: '+0,60%', up: true, live: false },
  { key: 'bcv_euro', label: 'EURO BCV', value: 'Bs. 916,00', change: '+0,53%', up: true, live: false },
  { key: 'binance_usdt', label: 'USDT BINANCE', value: 'Bs. 918,57', change: null, up: true, live: true },
]

const bsFormatter = new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function formatChange(change) {
  if (change == null) return null
  const sign = change >= 0 ? '+' : '−'
  return `${sign}${bsFormatter.format(Math.abs(change))}%`
}

function useLiveRates() {
  const [rates, setRates] = useState(FALLBACK_RATES)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch('/api/rates', { headers: { accept: 'application/json' } })
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return

        setRates([
          {
            key: 'bcv_dolar',
            label: 'DÓLAR BCV',
            value: data.bcv_dolar?.price != null ? `Bs. ${bsFormatter.format(data.bcv_dolar.price)}` : FALLBACK_RATES[0].value,
            change: formatChange(data.bcv_dolar?.change),
            up: (data.bcv_dolar?.change ?? 0) >= 0,
            live: false,
          },
          {
            key: 'bcv_euro',
            label: 'EURO BCV',
            value: data.bcv_euro?.price != null ? `Bs. ${bsFormatter.format(data.bcv_euro.price)}` : FALLBACK_RATES[1].value,
            change: formatChange(data.bcv_euro?.change),
            up: (data.bcv_euro?.change ?? 0) >= 0,
            live: false,
          },
          {
            key: 'binance_usdt',
            label: 'USDT BINANCE',
            value:
              data.binance_usdt?.price != null ? `Bs. ${bsFormatter.format(data.binance_usdt.price)}` : FALLBACK_RATES[2].value,
            change: null,
            up: true,
            live: true,
          },
        ])
      } catch {
        // Keep whatever we last had (fallback or previous live data).
      }
    }

    load()
    const id = setInterval(load, RATES_POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return rates
}

function RateStrip() {
  const rates = useLiveRates()
  const track = [...rates, ...rates]
  return (
    <div className="w-full overflow-hidden border-b border-white/10 bg-black/40">
      <div className="flex w-max animate-marquee items-center py-2 font-mono text-[11px] tracking-wide text-white/60">
        {track.map((r, i) => (
          <span key={i} className="flex items-center whitespace-nowrap px-5">
            <span className="text-white/40">{r.label}</span>
            <span className="ml-2 font-semibold text-white">{r.value}</span>
            {r.live ? (
              <span className="ml-2 inline-flex items-center gap-1 text-[#4ec97c]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4ec97c]" />
                EN VIVO
              </span>
            ) : r.change ? (
              <span className={r.up ? 'ml-2 text-[#4ec97c]' : 'ml-2 text-[#f04141]'}>{r.change}</span>
            ) : null}
            <span className="ml-5 text-[#b3222b]">&bull;</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function Home() {
  const [activeIndex, setActiveIndex] = useState(0)
  const stoppedRef = useRef(false)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const id = setInterval(() => {
      if (stoppedRef.current) return
      setActiveIndex((i) => (i + 1) % FEATURES.length)
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [])

  const stopAutoplay = () => {
    stoppedRef.current = true
  }

  const select = (i) => {
    stopAutoplay()
    setActiveIndex(i)
  }

  // Belt-and-suspenders: paint the body itself so nothing white ever
  // shows through below the fold on short/mobile viewports.
  useEffect(() => {
    const prevBg = document.body.style.background
    document.body.style.background = '#0a0607'
    return () => {
      document.body.style.background = prevBg
    }
  }, [])

  return (
    <div
      className="flex min-h-dvh w-full flex-col text-white"
      style={{
        background:
          'radial-gradient(ellipse 65% 50% at 50% 34%, #3a1a20 0%, #180d10 48%, #0a0607 100%)',
      }}
    >
      <RateStrip />

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-4 sm:py-5">
        {/* Top bar */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-7 w-7 rounded-md" />
            <span className="text-sm font-bold tracking-tight">Tasa Dolar Venezuela</span>
          </div>
          <Link
            to="/bot"
            className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-white/25 hover:text-white"
          >
            Telegram
          </Link>
        </div>

        {/* Two-column body: left = everything but the screenshot, right = screenshot */}
        <div className="grid flex-1 grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-10">
          {/* Left column */}
          <div className="flex flex-col items-center gap-5 text-center md:items-start md:text-left">
            <div className="flex flex-col gap-3">
              <h1 className="animate-rise-in text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                Tus tasas y cálculos
                <br />
                <span className="text-[#e2495a]">en un solo lugar</span>
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-white/55">
                BCV Dólar, Euro y USDT Binance actualizadas cada día. Convierte, guarda tus cálculos y arma pagos móviles en un toque.
              </p>
            </div>

            <FeatureTabs activeIndex={activeIndex} onSelect={select} className="hidden md:flex" />

            <div className="flex flex-col items-center gap-4 md:items-start">
              <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <a href={urls.android} target="_blank" rel="noreferrer" className="transition-transform hover:scale-[1.03]">
                  <img className="h-11 w-auto" src={playBanner} alt="Disponible en Google Play" />
                </a>
                <a href={urls.ios} target="_blank" rel="noreferrer" className="transition-transform hover:scale-[1.03]">
                  <img className="h-11 w-auto" src={appBanner} alt="Descargar en el App Store" />
                </a>
              </div>
              <p className="text-center font-mono text-[10.5px] text-white/40 md:text-left">
                Más de <CountUp end={100000} duration={1.8} separator="." className="text-white/60 font-medium" />+ descargas
                &middot; Datos oficiales BCV &middot; &copy; 2026
              </p>
            </div>
          </div>

          {/* Right column: screenshot, with the tab switcher as its header on mobile */}
          <div className="flex flex-col items-center gap-3">
            <FeatureTabs activeIndex={activeIndex} onSelect={select} className="flex md:hidden" />
            <PhoneImage activeIndex={activeIndex} onInteract={stopAutoplay} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
