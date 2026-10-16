const nf = new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const formatBs = (n) => (n == null || Number.isNaN(n) ? '—' : nf.format(n))

// Parse a user-typed amount. Accepts both conventions:
//  - es-VE "1.234,56" (dot thousands, comma decimal)
//  - plain "1234.56" / "1234,56" (single separator as decimal)
export const parseNum = (s) => {
  const str = String(s ?? '').trim()
  if (!str) return 0
  const normalized =
    str.includes('.') && str.includes(',')
      ? str.replace(/\./g, '').replace(',', '.')
      : str.replace(',', '.')
  return parseFloat(normalized) || 0
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
