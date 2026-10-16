import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('saved calculations', () => {
  let store, addCalculation, removeCalculation, loadCalculations, resultFor

  beforeEach(async () => {
    vi.resetModules()
    ;({ addCalculation, removeCalculation, loadCalculations, resultFor } = await import('../calculations'))
    store = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => store.set(k, v),
      removeItem: (k) => store.delete(k),
    })
  })

  it('keeps what another tab saved', () => {
    addCalculation({ id: 'a', type: 'bcv_to_bs', amount: 1 }) // tab 1
    addCalculation({ id: 'b', type: 'bcv_to_bs', amount: 2 }) // tab 2, which loaded before "a"

    expect(loadCalculations().map((c) => c.id)).toEqual(['a', 'b'])
  })

  it('does not bring back what another tab deleted', () => {
    addCalculation({ id: 'a', type: 'bcv_to_bs', amount: 1 })
    addCalculation({ id: 'b', type: 'bcv_to_bs', amount: 2 })
    removeCalculation('a') // tab 1
    removeCalculation('b') // tab 2, whose copy still had "a"

    expect(loadCalculations()).toEqual([])
  })

  it('converts with the day\'s rate, both ways', () => {
    const rates = { bcv: { price: 617.63 } }
    expect(resultFor({ type: 'bcv_to_bs', amount: 250 }, rates)).toBeCloseTo(154407.5)
    expect(resultFor({ type: 'bs_to_bcv', amount: 617.63 }, rates)).toBeCloseTo(1)
    expect(resultFor({ type: 'manual_to_bs', amount: 10, manualRate: '50,5' }, rates)).toBeCloseTo(505)
  })

  it('keeps this visit\'s calculations when storage is blocked', () => {
    const blocked = () => { throw new Error('SecurityError') }
    vi.stubGlobal('localStorage', { getItem: blocked, setItem: blocked, removeItem: blocked })

    addCalculation({ id: 'a', type: 'bcv_to_bs', amount: 1 })
    addCalculation({ id: 'b', type: 'bcv_to_bs', amount: 2 })
    expect(loadCalculations().map((c) => c.id)).toEqual(['a', 'b'])

    expect(removeCalculation('a').map((c) => c.id)).toEqual(['b'])
  })

  it('keeps this visit\'s calculations when storage is full', () => {
    store.set('tasa-dolar-pro-calculations', JSON.stringify([{ id: 'old', type: 'bcv_to_bs', amount: 1 }]))
    vi.stubGlobal('localStorage', {
      getItem: (k) => store.get(k) ?? null,
      setItem: () => { throw new Error('QuotaExceededError') },
      removeItem: (k) => store.delete(k),
    })

    addCalculation({ id: 'a', type: 'bcv_to_bs', amount: 1 })
    addCalculation({ id: 'b', type: 'bcv_to_bs', amount: 2 })

    expect(loadCalculations().map((c) => c.id)).toEqual(['old', 'a', 'b'])
  })
})
