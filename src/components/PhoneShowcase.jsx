import { useEffect, useState } from 'react'

function IconClose(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function IconStack(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <ellipse cx="12" cy="6" rx="8" ry="3.2" />
      <path d="M4 6v5.2c0 1.77 3.58 3.2 8 3.2s8-1.43 8-3.2V6" />
      <path d="M4 11.2v5.2c0 1.77 3.58 3.2 8 3.2s8-1.43 8-3.2v-5.2" />
    </svg>
  )
}

function IconBookmark(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4.2-7 4.2V4.5a1 1 0 0 1 1-1Z" />
    </svg>
  )
}

function IconCard(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.3" />
      <path d="M3 9.5h18" />
      <path d="M7 14h5" />
    </svg>
  )
}

function IconClock(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3.5 9A8.5 8.5 0 1 1 5 15.5" />
      <path d="M3.5 4v5h5" />
      <path d="M12 8v4.7l3.2 2" />
    </svg>
  )
}

function IconBell(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.5 5.2 1.5 5.7 0 .6-.5.8-1 .8H5.5c-.5 0-1-.2-1-.8 0-.5 1.5-1.7 1.5-5.7Z" />
      <path d="M9.5 19.5a2.5 2.5 0 0 0 5 0" />
    </svg>
  )
}

export const FEATURES = [
  {
    key: 'tasas',
    label: 'Tasas',
    icon: IconStack,
    src: '/ss-tasas.png',
    alt: 'Pantalla de Tasas mostrando BCV, Euro, USDT Binance y una tasa personalizada, con conversor de dólares a bolívares',
  },
  {
    key: 'calculos',
    label: 'Cálculos',
    icon: IconBookmark,
    src: '/ss-calculos.png',
    alt: 'Pantalla de Cálculos guardados que se recalculan solos con la tasa del día',
  },
  {
    key: 'pagomovil',
    label: 'Pago Móvil',
    icon: IconCard,
    src: '/ss-pagomovil.png',
    alt: 'Pantalla de Pago Móvil con los datos armados y listos para copiar o enviar',
  },
  {
    key: 'historial',
    label: 'Historial',
    icon: IconClock,
    src: '/ss-historial.png',
    alt: 'Pantalla de Historial con la tendencia de la tasa en las últimas semanas',
  },
  {
    key: 'notificaciones',
    label: 'Notificaciones',
    icon: IconBell,
    src: '/ss-notificaciones.png',
    alt: 'Notificación en la pantalla de bloqueo avisando que hay una nueva tasa disponible',
  },
]

const TAB_ROWS = [FEATURES.slice(0, 3), FEATURES.slice(3)]

export function FeatureTabs({ activeIndex, onSelect, className = '' }) {
  let index = -1
  return (
    <div
      role="tablist"
      aria-label="Funciones de la app"
      className={`flex flex-wrap items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-sm sm:flex-col sm:rounded-[26px] ${className}`}
    >
      {TAB_ROWS.map((row, ri) => (
        <div key={ri} className="contents sm:flex sm:items-center sm:gap-1">
          {row.map((f) => {
            index += 1
            const i = index
            const isActive = i === activeIndex
            const Icon = f.icon
            return (
              <button
                key={f.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelect(i)}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 sm:px-3.5 text-xs font-medium transition-colors cursor-pointer ${
                  isActive ? 'bg-[#b3222b] text-white shadow-[0_2px_10px_rgba(179,34,43,0.5)]' : 'text-white/55 hover:text-white/85'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{f.label}</span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export function PhoneImage({ activeIndex, className = '', onInteract }) {
  const active = FEATURES[activeIndex]
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const openFull = () => {
    onInteract?.()
    setOpen(true)
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div
        className="pointer-events-none absolute inset-0 -z-10 scale-125 blur-3xl opacity-80"
        style={{ background: 'radial-gradient(ellipse 55% 55% at 50% 45%, #7a1c26, transparent 70%)' }}
      />
      <button
        type="button"
        onClick={openFull}
        aria-label={`Ver en grande: ${active.label}`}
        className="relative block h-[50vh] sm:h-[56vh] md:h-[64vh] lg:h-[70vh] max-h-[720px] aspect-[926/1943] cursor-zoom-in appearance-none border-0 bg-transparent p-0"
      >
        {FEATURES.map((f, i) => (
          <img
            key={f.key}
            src={f.src}
            alt={f.alt}
            aria-hidden={i !== activeIndex}
            draggable="false"
            className={`absolute inset-0 h-full w-full select-none object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.6)] transition-opacity duration-700 ease-out ${
              i === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.label}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm animate-rise-in"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <IconClose className="h-5 w-5" />
          </button>
          <img
            src={active.src}
            alt={active.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] w-auto select-none"
          />
        </div>
      )}
    </div>
  )
}
