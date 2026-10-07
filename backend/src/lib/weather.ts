import {
    MAX_FORECAST_DAYS,
    WEATHER_FORECAST_URL,
    WEATHER_GEOCODING_URL,
    WEATHER_REQUEST_TIMEOUT_MS,
} from "./constants";

export class WeatherError extends Error {
    constructor(message: string, public status: number) {
        super(message);
    }
}

export interface CurrentWeather {
    city: string;
    country: string | null;
    temperature: number;
    precipitation: number;
    condition: string;
    icon: string;
}

export interface ForecastDay {
    date: string;
    condition: string;
    icon: string;
    tempMax: number;
    tempMin: number;
}

export interface Forecast {
    city: string;
    country: string | null;
    days: ForecastDay[];
}

function describeCode(code: number): { condition: string; icon: string } {
    if (code === 0) return { condition: "Clear sky", icon: "☀️" };
    if (code <= 2) return { condition: "Partly cloudy", icon: "🌤️" };
    if (code === 3) return { condition: "Overcast", icon: "☁️" };
    if (code <= 48) return { condition: "Fog", icon: "🌫️" };
    if (code <= 57) return { condition: "Drizzle", icon: "🌦️" };
    if (code <= 67) return { condition: "Rain", icon: "🌧️" };
    if (code <= 77) return { condition: "Snow", icon: "❄️" };
    if (code <= 82) return { condition: "Rain showers", icon: "🌧️" };
    if (code <= 86) return { condition: "Snow showers", icon: "🌨️" };
    return { condition: "Thunderstorm", icon: "⛈️" };
}

async function fetchJson(url: URL): Promise<any> {
    let res: Response;
    try {
        res = await fetch(url, { signal: AbortSignal.timeout(WEATHER_REQUEST_TIMEOUT_MS), cache: "no-store" });
    } catch {
        throw new WeatherError("Weather service is unavailable", 502);
    }
    if (!res.ok) throw new WeatherError("Weather service is unavailable", 502);
    return res.json();
}

async function geocode(city: string) {
    const url = new URL(WEATHER_GEOCODING_URL);
    url.searchParams.set("name", city);
    url.searchParams.set("count", "1");
    url.searchParams.set("language", "en");

    const data = await fetchJson(url);
    const place = data.results?.[0];
    if (!place) throw new WeatherError(`City "${city}" not found`, 404);

    return {
        name: place.name as string,
        country: (place.country as string | undefined) ?? null,
        latitude: place.latitude as number,
        longitude: place.longitude as number,
    };
}

export async function getCurrentWeather(city: string): Promise<CurrentWeather> {
    const place = await geocode(city);

    const url = new URL(WEATHER_FORECAST_URL);
    url.searchParams.set("latitude", String(place.latitude));
    url.searchParams.set("longitude", String(place.longitude));
    url.searchParams.set("current", "temperature_2m,precipitation,weather_code");
    const data = await fetchJson(url);

    const current = data.current;
    if (!current) throw new WeatherError("Weather service returned no data", 502);

    return {
        city: place.name,
        country: place.country,
        temperature: current.temperature_2m,
        precipitation: current.precipitation,
        ...describeCode(current.weather_code),
    };
}

export async function getForecast(city: string, days: number): Promise<Forecast> {
    if (!Number.isInteger(days) || days < 1 || days > MAX_FORECAST_DAYS) {
        throw new WeatherError(`"days" must be an integer between 1 and ${MAX_FORECAST_DAYS}`, 400);
    }
    const place = await geocode(city);

    const url = new URL(WEATHER_FORECAST_URL);
    url.searchParams.set("latitude", String(place.latitude));
    url.searchParams.set("longitude", String(place.longitude));
    url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", String(days));
    const data = await fetchJson(url);

    const daily = data.daily;
    if (!daily?.time) throw new WeatherError("Weather service returned no data", 502);

    return {
        city: place.name,
        country: place.country,
        days: (daily.time as string[]).map((date, i) => ({
            date,
            tempMax: daily.temperature_2m_max[i],
            tempMin: daily.temperature_2m_min[i],
            ...describeCode(daily.weather_code[i]),
        })),
    };
}
