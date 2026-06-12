export function formatMoney(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0,
  }).format(value)
}
