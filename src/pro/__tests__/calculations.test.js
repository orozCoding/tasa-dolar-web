import { beforeEach, describe, expect, it, vi } from 'vitest'
import { addCalculation, removeCalculation, loadCalculations, resultFor } from '../calculations'

describe('saved calculations', () => {
  let store

  beforeEach(() => {
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
})
