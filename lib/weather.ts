// Server-side weather fetcher using open-meteo (no API key required).
// Cached for 15 minutes via Next.js fetch revalidation.
// Returns the same shape as the former STUB_WEATHER constant.

const LATITUDE = 42.59;
const LONGITUDE = -82.92;
const TIMEZONE = "America/Detroit";

export type WeatherData = {
  temp: number;
  condition: string;
  high: number;
  low: number;
  icon: string;
};

function wmoToCondition(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: "Clear", icon: "☀️" };
  if (code === 1) return { condition: "Mostly Clear", icon: "🌤️" };
  if (code === 2) return { condition: "Partly Cloudy", icon: "⛅" };
  if (code === 3) return { condition: "Overcast", icon: "☁️" };
  if (code <= 48) return { condition: "Foggy", icon: "🌫️" };
  if (code <= 55) return { condition: "Drizzle", icon: "🌦️" };
  if (code <= 57) return { condition: "Freezing Drizzle", icon: "🌧️" };
  if (code <= 65) return { condition: "Rain", icon: "🌧️" };
  if (code <= 67) return { condition: "Freezing Rain", icon: "🌧️" };
  if (code <= 77) return { condition: "Snow", icon: "🌨️" };
  if (code <= 82) return { condition: "Showers", icon: "🌦️" };
  if (code <= 86) return { condition: "Snow Showers", icon: "🌨️" };
  return { condition: "Thunderstorm", icon: "⛈️" };
}

const FALLBACK: WeatherData = {
  temp: 0,
  condition: "Unavailable",
  high: 0,
  low: 0,
  icon: "—",
};

export async function getWeather(): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${LATITUDE}&longitude=${LONGITUDE}` +
    `&current=temperature_2m,weathercode` +
    `&daily=temperature_2m_max,temperature_2m_min` +
    `&temperature_unit=fahrenheit` +
    `&timezone=${encodeURIComponent(TIMEZONE)}` +
    `&forecast_days=1`;

  try {
    const res = await fetch(url, { next: { revalidate: 900 } }); // 15-min cache
    if (!res.ok) return FALLBACK;

    const json = await res.json();

    const temp = Math.round(json.current?.temperature_2m ?? 0);
    const code = json.current?.weathercode ?? 0;
    const high = Math.round(json.daily?.temperature_2m_max?.[0] ?? 0);
    const low = Math.round(json.daily?.temperature_2m_min?.[0] ?? 0);
    const { condition, icon } = wmoToCondition(code);

    return { temp, condition, high, low, icon };
  } catch {
    return FALLBACK;
  }
}
