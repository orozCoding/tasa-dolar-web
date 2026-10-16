// Saved calculations, the same kinds as the app's Cálculos tab. Kept in this
// browser only.
import { parseNum } from './numbers'

export const CALCULATIONS_KEY = 'tasa-dolar-pro-calculations'

export const CALCULATION_TYPES = [
  { value: 'bcv_to_bs', label: 'Dólar BCV a Bolívares', rate: 'bcv', from: '$', to: 'Bs.' },
  { value: 'euro_to_bs', label: 'Euro BCV a Bolívares', rate: 'bcv_euro', from: '€', to: 'Bs.' },
  { value: 'usdt_to_bs', label: 'USDT Binance a Bolívares', rate: 'binance_usdt', from: '₮', to: 'Bs.' },
  { value: 'bs_to_bcv', label: 'Bolívares a Dólar BCV', rate: 'bcv', from: 'Bs.', to: '$', inverse: true },
  { value: 'bs_to_euro', label: 'Bolívares a Euro BCV', rate: 'bcv_euro', from: 'Bs.', to: '€', inverse: true },
  { value: 'bs_to_usdt', label: 'Bolívares a USDT Binance', rate: 'binance_usdt', from: 'Bs.', to: '₮', inverse: true },
  { value: 'manual_to_bs', label: 'Tasa Manual a Bolívares', rate: 'manual', from: '$', to: 'Bs.' },
  { value: 'bs_to_manual', label: 'Bolívares a Tasa Manual', rate: 'manual', from: 'Bs.', to: '$', inverse: true },
]

export const typeFor = (value) => CALCULATION_TYPES.find((t) => t.value === value) || CALCULATION_TYPES[0]

export const rateFor = (calc, rates) => {
  const type = typeFor(calc.type)
  if (type.rate === 'manual') return parseNum(calc.manualRate)
  return rates?.[type.rate]?.price || 0
}

export const resultFor = (calc, rates) => {
  const rate = rateFor(calc, rates)
  const amount = Number(calc.amount) || 0
  if (rate <= 0 || amount <= 0) return 0
  return typeFor(calc.type).inverse ? amount / rate : amount * rate
}

export const loadCalculations = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CALCULATIONS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const saveCalculations = (calcs) => {
  try {
    localStorage.setItem(CALCULATIONS_KEY, JSON.stringify(calcs))
  } catch {
    // Storage full or blocked: keep them for this visit only.
  }
}

// Changes apply to what's stored now, not to this tab's copy, so two open
// tabs don't overwrite each other. Return the new list.
export const addCalculation = (calc) => {
  const next = [...loadCalculations(), calc]
  saveCalculations(next)
  return next
}

export const removeCalculation = (id) => {
  const next = loadCalculations().filter((c) => c.id !== id)
  saveCalculations(next)
  return next
}
