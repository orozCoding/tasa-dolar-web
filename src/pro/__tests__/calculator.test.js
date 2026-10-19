import { describe, expect, it } from 'vitest'
import { formatDisplay, initialCalculator, keyFromKeyboard, pressKey, resultOf } from '../calculator'

const press = (keys, state = initialCalculator) => keys.reduce(pressKey, state)

describe('pressKey', () => {
  it('types digits and a single decimal point', () => {
    expect(press(['1', '2', '.', '5', '.', '0']).display).toBe('12.50')
  })

  it('replaces the leading zero', () => {
    expect(press(['0', '7']).display).toBe('7')
  })

  it('chains operations', () => {
    const state = press(['5', '+', '3', '×'])
    expect(state.display).toBe('8')
    expect(press(['2', '='], state).display).toBe('16')
  })

  it('rounds float noise away', () => {
    expect(press(['0', '.', '1', '+', '0', '.', '2', '=']).display).toBe('0.3')
  })

  it('treats division by zero as 0', () => {
    expect(press(['8', '÷', '0', '=']).display).toBe('0')
  })

  it('starts a new number after =', () => {
    expect(press(['2', '+', '2', '=', '9']).display).toBe('9')
  })

  it('erases the last digit, down to 0', () => {
    expect(press(['1', '2', '⌫']).display).toBe('1')
    expect(press(['1', '⌫', '⌫']).display).toBe('0')
  })

  it('keeps the first operand when erasing right after an operator', () => {
    expect(press(['1', '2', '+', '⌫']).display).toBe('12')
  })

  it('clears a scientific-notation result with ⌫ instead of mangling it', () => {
    const big = press([...Array(15).fill('9'), '×', ...Array(15).fill('9'), '='])
    expect(big.display).toMatch(/e/)
    expect(pressKey(big, '⌫').display).toBe('0')
  })

  it('clears everything with C', () => {
    expect(press(['5', '+', '3', 'C'])).toEqual(initialCalculator)
  })

  it('caps the number of digits', () => {
    expect(press(Array(20).fill('9')).display).toHaveLength(15)
  })
})

describe('resultOf', () => {
  it('applies a pending operation', () => {
    expect(resultOf(press(['5', '+', '3']))).toBe(8)
  })

  it('is the first operand while the second one is not typed yet', () => {
    expect(resultOf(press(['5', '+']))).toBe(5)
  })

  it('is the shown number otherwise', () => {
    expect(resultOf(press(['4', '2', '.', '5']))).toBe(42.5)
  })
})

describe('formatDisplay', () => {
  it('groups thousands and uses a decimal comma', () => {
    expect(formatDisplay('1234567.5')).toBe('1.234.567,5')
  })

  it('keeps what is being typed', () => {
    expect(formatDisplay('12.')).toBe('12,')
    expect(formatDisplay('0.50')).toBe('0,50')
  })

  it('keeps the sign', () => {
    expect(formatDisplay('-1234')).toBe('-1.234')
  })
})

describe('keyFromKeyboard', () => {
  it('maps keyboard keys to calculator keys', () => {
    expect(keyFromKeyboard('7')).toBe('7')
    expect(keyFromKeyboard(',')).toBe('.')
    expect(keyFromKeyboard('*')).toBe('×')
    expect(keyFromKeyboard('-')).toBe('−')
    expect(keyFromKeyboard('Enter')).toBe('=')
    expect(keyFromKeyboard('Escape')).toBe('C')
    expect(keyFromKeyboard('a')).toBeNull()
  })
})
