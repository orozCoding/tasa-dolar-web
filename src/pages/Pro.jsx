import { useCallback, useEffect, useRef, useState } from 'react'
import logo from '/logo.png'
import themeSwitchIcon from '/theme-switch.svg'
import themeSwitchIconWhite from '/theme-switch-white.svg'
import { TOKEN_KEY, fetchRates, fetchSession, redeemCode, storedToken, storeToken } from '../pro/api'
import { copyText, formatBs, parseNum } from '../pro/numbers'
import {
  CALCULATIONS_KEY, CALCULATION_TYPES, addCalculation, loadCalculations, rateFor, removeCalculation, resultFor, typeFor,
} from '../pro/calculations'
import { formatDisplay, initialCalculator, keyFromKeyboard, pressKey, resultOf } from '../pro/calculator'

// Tasa Dolar Pro on the web (app.tasadolar.com). Only for Google Play Pro
// subscribers: they sign in with a one-time code from the Android app
// (Acerca de → Pro → Usar Pro en la web), and the license is re-checked on
// every visit.

const REFRESH_MS = 90_000
const SESSION_RECHECK_MS = 30 * 60_000
const MANAGE_SUBSCRIPTION_URL = 'https://play.google.com/store/account/subscriptions?sku=premium&package=com.orozcoding.tasadolarapp'

const codeErrors = {
  invalid_code: 'Código inválido o vencido. Genera uno nuevo en la app.',
  too_many_attempts: 'Demasiados intentos. Espera un minuto e intenta de nuevo.',
  request_failed: 'No pudimos conectar. Revisa tu conexión e intenta de nuevo.',
}

const RATE_CARDS = [
  { key: 'bcv', label: '$ Dólar BCV', symbol: '$', accent: 'border-l-red-600', labelColor: 'text-red-600' },
  { key: 'bcv_euro', label: '€ Euro BCV', symbol: '€', accent: 'border-l-blue-600', labelColor: 'text-blue-600 dark:text-blue-400' },
  { key: 'binance_usdt', label: '₮ USDT Binance', symbol: '₮', accent: 'border-l-yellow-500', labelColor: 'text-yellow-600 dark:text-yellow-500' },
]

const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function Pro() {
  const [darkMode, setDarkMode] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  // checking | signed_out | active | inactive | error
  const [status, setStatus] = useState(() => (storedToken() ? 'checking' : 'signed_out'))
  const [license, setLicense] = useState(null)
  // Bumped on sign-in and sign-out, so a session check that was already
  // under way can't undo either.
  const sessionGeneration = useRef(0)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    document.documentElement.classList.toggle('light', !darkMode)
  }, [darkMode])

  // Keep this page out of search indexes.
  useEffect(() => {
    const prevTitle = document.title
    document.title = 'Tasa Dolar Pro'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => {
      document.title = prevTitle
      document.head.removeChild(meta)
    }
  }, [])

  const applyLicense = (next) => {
    sessionGeneration.current += 1
    setLicense(next)
    setStatus(next?.active ? 'active' : 'inactive')
  }

  const signOut = () => {
    sessionGeneration.current += 1
    storeToken(null)
    setLicense(null)
    setStatus('signed_out')
  }

  const checkSession = useCallback(async ({ quiet = false } = {}) => {
    const token = storedToken()
    if (!token) return setStatus('signed_out')
    if (!quiet) setStatus('checking')
    const generation = sessionGeneration.current
    const stillCurrent = () => generation === sessionGeneration.current && storedToken() === token

    try {
      const result = await fetchSession(token)
      if (!stillCurrent()) {
        // Another tab signed out meanwhile: don't stay on "Verificando".
        if (generation === sessionGeneration.current && !storedToken()) signOut()
        return
      }
      if (result.error === 'signed_out') return signOut()
      if (result.error) {
        // A failed re-check while already signed in keeps the page usable.
        if (!quiet) setStatus('error')
        return
      }
      applyLicense(result.license)
    } catch {
      if (stillCurrent()) {
        if (!quiet) setStatus('error')
      } else if (generation === sessionGeneration.current && !storedToken()) {
        signOut()
      }
    }
  }, [])

  // Signing out (or in) in another tab applies here right away.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== TOKEN_KEY && e.key !== null) return
      if (!storedToken()) signOut()
      else checkSession()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [checkSession])

  useEffect(() => {
    if (storedToken()) checkSession()
  }, [checkSession])

  // Re-check now and then, so an expired subscription or a sign-in from
  // another computer is noticed without reloading.
  useEffect(() => {
    if (status !== 'active') return
    const id = setInterval(() => checkSession({ quiet: true }), SESSION_RECHECK_MS)
    return () => clearInterval(id)
  }, [status, checkSession])

  return (
    <div className="min-h-screen w-full px-4 py-6 text-black dark:text-white flex flex-col items-center">
      <header className="w-full max-w-5xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img className="w-10 rounded-md" src={logo} alt="Tasa Dolar Venezuela" />
          <div>
            <h1 className="text-xl font-bold leading-tight">Tasa Dolar <span className="text-red-600">Pro</span></h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">BCV, Euro y USDT con tus cálculos</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {status === 'active' && (
            <button onClick={signOut} className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
              Cerrar sesión
            </button>
          )}
          <img
            className="w-9 rounded-md cursor-pointer"
            src={darkMode ? themeSwitchIconWhite : themeSwitchIcon}
            onClick={() => setDarkMode(!darkMode)}
            alt="Cambiar tema"
          />
        </div>
      </header>

      <main className="w-full max-w-5xl flex-1 flex flex-col items-center mt-8">
        {status === 'checking' && <div className="animate-pulse text-gray-400 mt-20">Verificando tu suscripción…</div>}

        {status === 'error' && (
          <div className="mt-20 flex flex-col items-center gap-4">
            <p className="text-red-500 text-center max-w-sm">No pudimos verificar tu suscripción. Revisa tu conexión.</p>
            <button onClick={() => checkSession()} className="rounded-lg border border-gray-400 dark:border-gray-600 px-5 py-2 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800">
              Reintentar
            </button>
          </div>
        )}

        {status === 'signed_out' && <CodeLogin onSignedIn={applyLicense} />}

        {status === 'inactive' && <Inactive onSignOut={signOut} />}

        {status === 'active' && <Dashboard license={license} />}
      </main>
    </div>
  )
}

function CodeLogin({ onSignedIn }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, '')

  // Shown as "K7Q-4MX", like in the app.
  const onChange = (e) => {
    const chars = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    setCode(chars.length > 3 ? `${chars.slice(0, 3)}-${chars.slice(3)}` : chars)
    setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    if (normalized.length !== 6 || busy) return

    setBusy(true)
    try {
      const result = await redeemCode(normalized)
      if (result.token) {
        storeToken(result.token)
        onSignedIn(result.license)
        return
      }
      setError(codeErrors[result.error] || codeErrors.request_failed)
    } catch {
      setError(codeErrors.request_failed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="w-full max-w-md mt-10 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-2xl font-bold">Entra con tu código</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tasa Dolar Pro en tu computadora es para suscriptores Pro de la app Android.
        </p>
      </div>

      <ol className="text-sm flex flex-col gap-2 list-decimal list-inside text-gray-600 dark:text-gray-300">
        <li>Abre la app Tasa Dolar en tu teléfono Android.</li>
        <li>Ve a <b>Acerca de</b> → <b>Usar Pro en la web</b>.</li>
        <li>Escribe aquí el código que aparece.</li>
      </ol>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          value={code}
          onChange={onChange}
          placeholder="ABC-123"
          aria-label="Código de la app"
          autoFocus
          autoComplete="one-time-code"
          spellCheck={false}
          className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-center text-3xl font-mono font-semibold tracking-[0.3em] uppercase outline-none focus:border-red-500"
        />
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <button
          type="submit"
          disabled={normalized.length !== 6 || busy}
          className="rounded-xl bg-gradient-to-r from-red-500 to-yellow-500 px-6 py-3 font-bold text-white shadow-md disabled:opacity-40 hover:brightness-105 transition-all"
        >
          {busy ? 'Verificando…' : 'Entrar'}
        </button>
      </form>

      <p className="text-xs text-center text-gray-400">
        ¿Aún no tienes Pro? Suscríbete desde la app Android en <b>Acerca de</b>.
      </p>
    </section>
  )
}

function Inactive({ onSignOut }) {
  return (
    <section className="w-full max-w-md mt-10 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 flex flex-col items-center gap-4 text-center">
      <h2 className="text-2xl font-bold">Tu suscripción Pro no está activa</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Renuévala en Google Play y vuelve a entrar con un código nuevo desde la app.
      </p>
      <a
        href={MANAGE_SUBSCRIPTION_URL}
        target="_blank"
        rel="noreferrer"
        className="rounded-xl bg-gray-900 dark:bg-white dark:text-black text-white px-6 py-3 font-bold"
      >
        Abrir Google Play
      </a>
      <button onClick={onSignOut} className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
        Ingresar otro código
      </button>
    </section>
  )
}

function Dashboard({ license }) {
  const [rates, setRates] = useState(null)
  const [ratesError, setRatesError] = useState(false)
  const [active, setActive] = useState('bcv')
  const [manualRate, setManualRate] = useState('')
  const [amount, setAmount] = useState('')
  const [bs, setBs] = useState('')
  const [calculator, setCalculator] = useState(initialCalculator)
  const [flashed, setFlashed] = useState(null)
  const flashTimer = useRef(null)
  const amountRef = useRef(null)
  const bsRef = useRef(null)

  const load = useCallback(async () => {
    try {
      setRates(await fetchRates())
      setRatesError(false)
    } catch {
      setRatesError(true)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, REFRESH_MS)
    return () => clearInterval(id)
  }, [load])

  useEffect(() => () => clearTimeout(flashTimer.current), [])

  if (!rates && !ratesError) return <div className="animate-pulse text-gray-400 mt-20">Cargando tasas…</div>
  if (!rates) {
    return (
      <div className="mt-20 flex flex-col items-center gap-4">
        <p className="text-red-500">No pudimos cargar las tasas.</p>
        <button onClick={load} className="rounded-lg border border-gray-400 dark:border-gray-600 px-5 py-2 font-semibold">Reintentar</button>
      </div>
    )
  }

  const activeRate = active === 'manual' ? parseNum(manualRate) : rates[active]?.price || 0
  const activeSymbol = active === 'manual' ? '$' : RATE_CARDS.find((c) => c.key === active)?.symbol

  // What the field icons and "Usar el resultado en" put in a field: the
  // calculator's result rounded to cents, as "1.234,56". Nothing below 0.
  const calcResult = resultOf(calculator)
  const calcValue = calcResult > 0 ? formatBs(calcResult) : null

  // Fills a converter field from the calculator and points at it, since on a
  // phone it can be off screen.
  const fillConverter = (field) => {
    if (!calcValue) return
    const ref = field === 'amount' ? amountRef : bsRef
    ;(field === 'amount' ? setAmount : setBs)(calcValue)
    ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    setFlashed(field)
    clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlashed(null), 1200)
  }

  const injectInto = (rateKey, field) => {
    setActive(rateKey)
    fillConverter(field)
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {RATE_CARDS.map((card) => (
              <RateCard key={card.key} card={card} rate={rates[card.key]} selected={active === card.key} onSelect={() => setActive(card.key)} />
            ))}
            <ManualRateCard value={manualRate} onChange={setManualRate} selected={active === 'manual'} onSelect={() => setActive('manual')} calcValue={calcValue} />
          </div>
          {ratesError && <p className="text-xs text-red-500">No pudimos actualizar las tasas. Mostrando las últimas cargadas.</p>}
          <Converter
            rate={activeRate}
            symbol={activeSymbol}
            amount={amount}
            onAmount={setAmount}
            bs={bs}
            onBs={setBs}
            calcValue={calcValue}
            onFill={fillConverter}
            amountRef={amountRef}
            bsRef={bsRef}
            flashed={flashed}
          />
        </div>

        <div className="flex flex-col gap-6">
          <Calculator state={calculator} onChange={setCalculator} value={calcValue} rates={rates} onInject={injectInto} />
          <SavedCalculations rates={rates} calcValue={calcValue} />
        </div>
      </div>

      <p className="text-center text-xs text-gray-400">
        Pro activo{license?.plan === 'yearly' ? ' · plan anual' : license?.plan === 'monthly' ? ' · plan mensual' : ''}
        {license?.expires_at ? ` · válido hasta el ${formatDate(license.expires_at)}` : ''}
      </p>
    </div>
  )
}

function CalculatorIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z" />
    </svg>
  )
}

// The calculator icon next to a field: puts the calculator's result in it.
function FillButton({ value, onFill }) {
  const label = value ? `Usar el resultado de la calculadora (${value})` : 'La calculadora está en 0'
  return (
    <button
      type="button"
      onClick={onFill}
      disabled={!value}
      title={label}
      aria-label={label}
      className="shrink-0 rounded-md p-1 text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none"
    >
      <CalculatorIcon className="w-5 h-5" />
    </button>
  )
}

const CALCULATOR_KEYS = [
  { key: 'C', kind: 'action', span: 2 }, { key: '⌫', kind: 'action' }, { key: '÷', kind: 'op' },
  { key: '7' }, { key: '8' }, { key: '9' }, { key: '×', kind: 'op' },
  { key: '4' }, { key: '5' }, { key: '6' }, { key: '−', kind: 'op' },
  { key: '1' }, { key: '2' }, { key: '3' }, { key: '+', kind: 'op' },
  { key: '0', span: 2 }, { key: '.', label: ',' }, { key: '=', kind: 'equals' },
]

const KEY_STYLES = {
  digit: 'bg-white border border-gray-200 dark:border-transparent dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700',
  action: 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500',
  op: 'bg-red-600 text-white hover:bg-red-700',
  equals: 'bg-gray-900 text-white dark:bg-white dark:text-black hover:opacity-90',
}

// Always on screen, unlike the app's pop-up calculator. Its result goes into
// any field through the icon next to it, or into the converter from the
// buttons at the bottom. Also works from the keyboard while no field has
// focus.
function Calculator({ state, onChange, value, rates, onInject }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target
      if (target instanceof HTMLElement) {
        if (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
        // Enter on a focused button or link is that button's own click.
        if (e.key === 'Enter' && target.closest('button, a, [role="button"]')) return
      }
      const key = keyFromKeyboard(e.key)
      if (!key) return
      e.preventDefault()
      onChange((s) => pressKey(s, key))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onChange])

  const injectable = RATE_CARDS.filter((card) => rates?.[card.key])

  return (
    <div className="rounded-3xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-4 w-full">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Calculadora</h2>

      <div className="rounded-2xl bg-white border border-gray-200 dark:border-transparent dark:bg-gray-900 px-4 py-3 text-right flex flex-col justify-end min-h-[4.75rem]" aria-live="polite">
        <span className="text-xs text-gray-400 h-4 tabular-nums">{state.op ? `${formatDisplay(String(state.prev))} ${state.op}` : ''}</span>
        <span className="text-3xl font-bold tabular-nums break-all">{formatDisplay(state.display)}</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {CALCULATOR_KEYS.map(({ key, label, kind = 'digit', span }) => (
          <button
            key={key}
            type="button"
            // Clicking doesn't take focus, so Enter keeps meaning "=".
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChange((s) => pressKey(s, key))}
            aria-label={key === '.' ? 'Coma decimal' : key === '⌫' ? 'Borrar' : key === 'C' ? 'Limpiar' : undefined}
            className={`h-12 rounded-xl text-lg font-bold transition-colors ${KEY_STYLES[kind]} ${span === 2 ? 'col-span-2' : ''}`}
          >
            {label || key}
          </button>
        ))}
      </div>

      {injectable.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-gray-200 dark:border-gray-800 pt-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Usar el resultado{value ? <> (<b className="tabular-nums">{value}</b>)</> : ''} en
          </span>
          <div className="grid grid-cols-2 gap-2">
            {injectable.map((card) => [
              <InjectButton key={`${card.key}-amount`} disabled={!value} title={`${card.label} a bolívares`} onClick={() => onInject(card.key, 'amount')}>
                {card.symbol} a Bs.
              </InjectButton>,
              <InjectButton key={`${card.key}-bs`} disabled={!value} title={`Bolívares a ${card.label}`} onClick={() => onInject(card.key, 'bs')}>
                Bs. a {card.symbol}
              </InjectButton>,
            ])}
          </div>
        </div>
      )}
    </div>
  )
}

function InjectButton({ children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      className="rounded-xl border border-gray-300 dark:border-gray-500 bg-white/60 dark:bg-gray-800 px-3 py-2 text-sm font-semibold hover:border-red-500 hover:text-red-600 disabled:opacity-40 disabled:pointer-events-none transition-colors"
    >
      {children}
    </button>
  )
}

function RateCard({ card, rate, selected, onSelect }) {
  const [copied, setCopied] = useState(false)
  const percent = rate?.percentage

  const copy = async (e) => {
    e.stopPropagation()
    await copyText(formatBs(rate.price))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      className={`text-left rounded-2xl border border-l-4 ${card.accent} p-5 cursor-pointer transition-colors ${
        selected ? 'border-gray-900 dark:border-white bg-white dark:bg-gray-900' : 'border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-900'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold uppercase tracking-widest ${card.labelColor}`}>{card.label}</span>
        {percent && (
          <span className={`text-xs font-semibold ${percent.positive ? 'text-green-600' : 'text-red-600'}`}>
            {percent.positive ? '+' : ''}{percent.percent}%
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-2xl font-bold tabular-nums">{rate ? `Bs. ${formatBs(rate.price)}` : 'Bs. ···'}</span>
        {rate && (
          <button onClick={copy} className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label={`Copiar ${card.label}`}>
            {copied ? '¡Copiado!' : 'Copiar'}
          </button>
        )}
      </div>
      <div className="mt-1 text-xs text-gray-400">{rate?.date || 'No disponible'}</div>
    </div>
  )
}

function ManualRateCard({ value, onChange, selected, onSelect, calcValue }) {
  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border border-l-4 border-l-gray-500 p-5 cursor-pointer transition-colors ${
        selected ? 'border-gray-900 dark:border-white bg-white dark:bg-gray-900' : 'border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60'
      }`}
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Tasa manual</span>
      <div className="mt-2 flex items-center gap-1 text-2xl font-bold">
        <span>Bs.</span>
        <input
          inputMode="decimal"
          value={value}
          onFocus={onSelect}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0,00"
          aria-label="Tasa manual en bolívares"
          className="w-full bg-transparent outline-none tabular-nums"
        />
        <FillButton value={calcValue} onFill={() => onChange(calcValue)} />
      </div>
      <div className="mt-1 text-xs text-gray-400">tu tasa manual</div>
    </div>
  )
}

function Converter({ rate, symbol, amount, onAmount, bs, onBs, calcValue, onFill, amountRef, bsRef, flashed }) {
  const toBs = rate > 0 ? parseNum(amount) * rate : 0
  const fromBs = rate > 0 ? parseNum(bs) / rate : 0

  return (
    <div className="rounded-3xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Conversión</h2>
      {rate <= 0 && <p className="text-sm text-gray-400">Elige una tasa o escribe tu tasa manual.</p>}

      <ConverterRow
        label={`${symbol} a Bs.`} prefix={symbol} value={amount} onChange={onAmount}
        result={`Bs. ${formatBs(toBs)}`} copyValue={formatBs(toBs)}
        calcValue={calcValue} onFill={() => onFill('amount')} inputRef={amountRef} flashed={flashed === 'amount'}
      />
      <ConverterRow
        label={`Bs. a ${symbol}`} prefix="Bs." value={bs} onChange={onBs}
        result={`${symbol} ${formatBs(fromBs)}`} copyValue={formatBs(fromBs)}
        calcValue={calcValue} onFill={() => onFill('bs')} inputRef={bsRef} flashed={flashed === 'bs'}
      />
    </div>
  )
}

function ConverterRow({ label, prefix, value, onChange, result, copyValue, calcValue, onFill, inputRef, flashed }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await copyText(copyValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className={`flex flex-1 items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${flashed ? 'border-red-500 ring-2 ring-red-500/40' : 'border-gray-300 dark:border-gray-700'}`}>
          <span className="text-sm text-gray-400">{prefix}</span>
          <input ref={inputRef} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0,00" aria-label={label} className="w-full bg-transparent outline-none tabular-nums" />
          <FillButton value={calcValue} onFill={onFill} />
        </div>
        <button onClick={copy} className="flex-1 text-left sm:text-right text-lg font-bold tabular-nums hover:opacity-80" title="Copiar">
          {copied ? '¡Copiado!' : result}
        </button>
      </div>
    </div>
  )
}

function SavedCalculations({ rates, calcValue }) {
  const [calcs, setCalcs] = useState(loadCalculations)
  const [adding, setAdding] = useState(false)
  const [type, setType] = useState('bcv_to_bs')
  const [amount, setAmount] = useState('')
  const [manualRate, setManualRate] = useState('')

  // Another tab saved or deleted one: show the same list here.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === CALCULATIONS_KEY || e.key === null) setCalcs(loadCalculations())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const draft = { type, amount: parseNum(amount), manualRate }
  const draftResult = resultFor(draft, rates)
  const draftType = typeFor(type)

  const add = (e) => {
    e.preventDefault()
    if (draftResult <= 0) return
    setCalcs(addCalculation({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ...draft }))
    setAmount('')
    setManualRate('')
    setAdding(false)
  }

  return (
    <div className="rounded-3xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-4 self-start w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Cálculos guardados</h2>
        {!adding && (
          <button onClick={() => setAdding(true)} className="text-sm font-semibold text-red-600 hover:underline">+ Añadir</button>
        )}
      </div>

      {calcs.length === 0 && !adding && (
        <p className="text-sm text-gray-400">Guarda conversiones recurrentes que se actualizan automáticamente con las tasas del día.</p>
      )}

      {calcs.map((calc) => (
        <SavedCalculation key={calc.id} calc={calc} rates={rates} onDelete={() => setCalcs(removeCalculation(calc.id))} />
      ))}

      {adding && (
        <form onSubmit={add} className="flex flex-col gap-3 rounded-2xl bg-gray-100 dark:bg-gray-900 p-4">
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Tipo de cálculo" className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2">
            {CALCULATION_TYPES.filter((t) => t.rate === 'manual' || rates?.[t.rate]).map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {draftType.rate === 'manual' && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2">
              <input inputMode="decimal" value={manualRate} onChange={(e) => setManualRate(e.target.value)} placeholder="Tasa manual (Bs.)" aria-label="Tasa manual" className="w-full bg-transparent outline-none" />
              <FillButton value={calcValue} onFill={() => setManualRate(calcValue)} />
            </div>
          )}
          <div className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2">
            <span className="text-sm text-gray-400">{draftType.from}</span>
            <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Monto" aria-label="Monto" autoFocus className="w-full bg-transparent outline-none" />
            <FillButton value={calcValue} onFill={() => setAmount(calcValue)} />
          </div>
          <p className="text-sm">
            Resultado: <b className="tabular-nums">{draftType.to} {formatBs(draftResult)}</b>
          </p>
          <div className="flex gap-2">
            <button type="submit" disabled={draftResult <= 0} className="flex-1 rounded-xl bg-gray-900 dark:bg-white dark:text-black text-white px-4 py-2 font-bold disabled:opacity-40">Guardar</button>
            <button type="button" onClick={() => setAdding(false)} className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2">Cancelar</button>
          </div>
        </form>
      )}
    </div>
  )
}

function SavedCalculation({ calc, rates, onDelete }) {
  const [copied, setCopied] = useState(false)
  const type = typeFor(calc.type)
  const rate = rateFor(calc, rates)
  const result = resultFor(calc, rates)

  const copy = async () => {
    await copyText(formatBs(result))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{type.label}</span>
        <button onClick={onDelete} className="text-xs text-gray-400 hover:text-red-500" aria-label="Eliminar cálculo">Eliminar</button>
      </div>
      <span className="text-xs text-gray-400">Tasa: Bs. {formatBs(rate)}</span>
      <div className="flex items-center justify-between gap-2 text-lg">
        <span className="tabular-nums">{type.from} {formatBs(Number(calc.amount))}</span>
        <span className="text-gray-400">→</span>
        <button onClick={copy} className="font-bold tabular-nums hover:opacity-80" title="Copiar">
          {copied ? '¡Copiado!' : `${type.to} ${formatBs(result)}`}
        </button>
      </div>
    </div>
  )
}

export default Pro
