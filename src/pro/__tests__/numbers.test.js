import { describe, expect, it } from 'vitest'
import { parseNum } from '../numbers'

describe('parseNum', () => {
  it('reads es-VE amounts', () => {
    expect(parseNum('1.234.567,89')).toBe(1234567.89)
    expect(parseNum('1.234.567')).toBe(1234567)
    expect(parseNum('617,63')).toBe(617.63)
  })

  it('reads en amounts', () => {
    expect(parseNum('1,234,567.89')).toBe(1234567.89)
    expect(parseNum('1,234,567')).toBe(1234567)
  })

  it('takes a single separator as the decimal', () => {
    expect(parseNum('1234.56')).toBe(1234.56)
    expect(parseNum('1234,56')).toBe(1234.56)
    expect(parseNum('100')).toBe(100)
    expect(parseNum(' 100 ')).toBe(100)
  })

  it('returns 0 for empty or malformed input instead of a partial number', () => {
    expect(parseNum('')).toBe(0)
    expect(parseNum(null)).toBe(0)
    expect(parseNum('12abc')).toBe(0)
    expect(parseNum('1.2.3,4,5')).toBe(0)
    expect(parseNum('-5')).toBe(0)
  })
})
