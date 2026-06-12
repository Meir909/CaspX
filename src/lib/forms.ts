export type PlateParts = {
  country: string
  numbers: string
  letters: string
  region: string
}

export function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, '').replace(/^7/, '').slice(0, 10)
  const part1 = digits.slice(0, 3)
  const part2 = digits.slice(3, 6)
  const part3 = digits.slice(6, 8)
  const part4 = digits.slice(8, 10)

  let formatted = ''
  if (part1) formatted += part1
  if (part2) formatted += ` ${part2}`
  if (part3) formatted += `-${part3}`
  if (part4) formatted += `-${part4}`

  return {
    digits,
    value: formatted.trim(),
    full: digits ? `+7 ${formatted.trim()}`.trim() : '+7',
  }
}

export function normalizePhoneForApi(value: string) {
  const digits = value.replace(/\D/g, '').replace(/^7/, '').slice(0, 10)
  return digits.length ? `+7${digits}` : '+7'
}

export function parsePlateValue(value?: string): PlateParts {
  const normalized = (value || '').toUpperCase().replace(/[^A-ZА-Я0-9]/g, ' ').trim()
  const parts = normalized.split(/\s+/)

  return {
    country: parts[0] || 'KZ',
    numbers: parts[1] || '',
    letters: parts[2] || '',
    region: parts[3] || '',
  }
}

export function joinPlateValue(parts: PlateParts) {
  return [parts.country, parts.numbers, parts.letters, parts.region]
    .map((part) => part.trim().toUpperCase())
    .filter(Boolean)
    .join(' ')
}
