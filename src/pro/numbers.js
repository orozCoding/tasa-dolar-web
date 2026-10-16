const nf = new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const formatBs = (n) => (n == null || Number.isNaN(n) ? '—' : nf.format(n))

// Parse a user-typed amount. Returns 0 for anything that isn't a number.
// Accepts:
//  - es-VE "1.234.567,89" (dot thousands, comma decimal), and "1.234.567"
//  - en "1,234,567.89", and "1,234,567"
//  - a single separator as the decimal: "1234.56", "1234,56"
export const parseNum = (s) => {
  const str = String(s ?? '').trim().replace(/\s/g, '')
  if (!str) return 0

  const dots = (str.match(/\./g) || []).length
  const commas = (str.match(/,/g) || []).length
  let normalized = str

  if (dots && commas) {
    // Whichever comes last is the decimal separator.
    normalized = str.lastIndexOf(',') > str.lastIndexOf('.')
      ? str.replace(/\./g, '').replace(',', '.')
      : str.replace(/,/g, '')
  } else if (dots > 1) {
    normalized = str.replace(/\./g, '')
  } else if (commas > 1) {
    normalized = str.replace(/,/g, '')
  } else {
    normalized = str.replace(',', '.')
  }

  if (!/^\d+(\.\d+)?$|^\.\d+$/.test(normalized)) return 0
  return parseFloat(normalized)
}

export const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
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
}
