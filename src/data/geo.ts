export type GeoCity = {
  name: string
  lat: number
  lng: number
}

export type GeoCountry = {
  country: string
  cities: GeoCity[]
}

export const locationCatalog: GeoCountry[] = [
  {
    country: 'Казахстан',
    cities: [
      { name: 'Актау', lat: 43.6532, lng: 51.1975 },
      { name: 'Астана', lat: 51.1694, lng: 71.4491 },
      { name: 'Алматы', lat: 43.2389, lng: 76.8897 },
    ],
  },
  {
    country: 'Азербайджан',
    cities: [
      { name: 'Баку', lat: 40.4093, lng: 49.8671 },
      { name: 'Гянджа', lat: 40.6828, lng: 46.3606 },
      { name: 'Сумгаит', lat: 40.5897, lng: 49.6686 },
    ],
  },
  {
    country: 'Грузия',
    cities: [
      { name: 'Тбилиси', lat: 41.7151, lng: 44.8271 },
      { name: 'Батуми', lat: 41.6168, lng: 41.6367 },
      { name: 'Поти', lat: 42.1462, lng: 41.6719 },
    ],
  },
  {
    country: 'Турция',
    cities: [
      { name: 'Стамбул', lat: 41.0082, lng: 28.9784 },
      { name: 'Анкара', lat: 39.9334, lng: 32.8597 },
      { name: 'Мерсин', lat: 36.8121, lng: 34.6415 },
    ],
  },
  {
    country: 'Узбекистан',
    cities: [
      { name: 'Ташкент', lat: 41.2995, lng: 69.2401 },
      { name: 'Самарканд', lat: 39.6542, lng: 66.9597 },
      { name: 'Нукус', lat: 42.4602, lng: 59.6166 },
    ],
  },
  {
    country: 'Кыргызстан',
    cities: [
      { name: 'Бишкек', lat: 42.8746, lng: 74.5698 },
      { name: 'Ош', lat: 40.5139, lng: 72.8161 },
      { name: 'Джалал-Абад', lat: 40.9333, lng: 73.0 },
    ],
  },
  {
    country: 'Туркменистан',
    cities: [
      { name: 'Ашхабад', lat: 37.9601, lng: 58.3261 },
      { name: 'Туркменбаши', lat: 40.0222, lng: 52.9552 },
      { name: 'Мары', lat: 37.6184, lng: 61.8331 },
    ],
  },
  {
    country: 'Россия',
    cities: [
      { name: 'Астрахань', lat: 46.3479, lng: 48.0336 },
      { name: 'Махачкала', lat: 42.9849, lng: 47.5047 },
      { name: 'Москва', lat: 55.7558, lng: 37.6173 },
    ],
  },
  {
    country: 'Польша',
    cities: [
      { name: 'Варшава', lat: 52.2297, lng: 21.0122 },
      { name: 'Гданьск', lat: 54.352, lng: 18.6466 },
      { name: 'Лодзь', lat: 51.7592, lng: 19.456 },
    ],
  },
  {
    country: 'Германия',
    cities: [
      { name: 'Берлин', lat: 52.52, lng: 13.405 },
      { name: 'Гамбург', lat: 53.5511, lng: 9.9937 },
      { name: 'Мюнхен', lat: 48.1351, lng: 11.582 },
    ],
  },
]

export function getCitiesByCountry(country: string) {
  return locationCatalog.find((item) => item.country === country)?.cities ?? []
}

export function findCity(country: string, city: string) {
  return getCitiesByCountry(country).find((item) => item.name === city)
}
