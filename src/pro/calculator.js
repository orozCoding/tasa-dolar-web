// The basic calculator on the Pro page, same behavior as the app's
// CalculatorModal: chained operations, C, ⌫ and =. The display is kept as a
// plain number string ("1234.5") and only formatted for showing.

export const OPERATORS = ['+', '−', '×', '÷']
const MAX_DIGITS = 15

export const initialCalculator = { display: '0', prev: null, op: null, resetNext: false }

const round = (n) => parseFloat(n.toFixed(10))

const calculate = (a, op, b) => {
  switch (op) {
    case '+': return a + b
    case '−': return a - b
    case '×': return a * b
    case '÷': return b !== 0 ? a / b : 0
    default: return b
  }
}

export const pressKey = (state, key) => {
  const { display, prev, op, resetNext } = state

  if (key === 'C') return initialCalculator

  if (key === '⌫') {
    // Right after an operator there is nothing typed yet to erase.
    if (resetNext && op) return state
    // A huge or tiny result like "1e+21" can't lose a character and stay right.
    if (/e/i.test(display)) return { ...state, display: '0', resetNext: false }
    const next = display.slice(0, -1)
    return { ...state, display: next === '' || next === '-' ? '0' : next, resetNext: false }
  }

  if (key === '.') {
    if (resetNext) return { ...state, display: '0.', resetNext: false }
    return display.includes('.') ? state : { ...state, display: `${display}.` }
  }

  if (OPERATORS.includes(key)) {
    const current = parseFloat(display)
    if (prev !== null && op && !resetNext) {
      const result = String(round(calculate(prev, op, current)))
      return { display: result, prev: parseFloat(result), op: key, resetNext: true }
    }
    return { ...state, prev: current, op: key, resetNext: true }
  }

  if (key === '=') {
    if (prev === null || !op) return state
    return { display: String(round(calculate(prev, op, parseFloat(display)))), prev: null, op: null, resetNext: true }
  }

  if (/^\d$/.test(key)) {
    if (resetNext) return { ...state, display: key, resetNext: false }
    if (display.replace(/\D/g, '').length >= MAX_DIGITS) return state
    return { ...state, display: display === '0' ? key : display + key }
  }

  return state
}

// What the calculator is showing, with any pending operation applied:
// after "5 + 3" it's 8, as if = had been pressed.
export const resultOf = ({ display, prev, op, resetNext }) => {
  const current = parseFloat(display)
  if (prev !== null && op && !resetNext) return round(calculate(prev, op, current))
  return current
}

// "1234.5" → "1.234,5", keeping a trailing comma or zeros while typing.
export const formatDisplay = (display) => {
  const str = String(display)
  if (!/^-?\d+(\.\d*)?$/.test(str)) return str
  const negative = str.startsWith('-')
  const [int, dec] = str.replace('-', '').split('.')
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${negative ? '-' : ''}${grouped}${dec !== undefined ? `,${dec}` : ''}`
}

// Keyboard keys the calculator answers to.
const KEYBOARD = {
  '+': '+', '-': '−', '*': '×', x: '×', X: '×', '/': '÷',
  '.': '.', ',': '.', Enter: '=', '=': '=', Backspace: '⌫', Escape: 'C', Delete: 'C',
}

export const keyFromKeyboard = (key) => (/^\d$/.test(key) ? key : KEYBOARD[key] || null)
