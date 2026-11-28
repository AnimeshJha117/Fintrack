const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })
export function FormatMoney(minor) {
  return formatter.format(minor / 100)
}
export function ToMinor(input) {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(input.trim())
  if (!match) return null
  const minor = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'))
  return minor > 0 ? minor : null
}
export function FromMinor(minor) {
  return (minor / 100).toFixed(2)
}
