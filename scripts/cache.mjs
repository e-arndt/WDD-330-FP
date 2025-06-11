import { getCityData } from "./citySearch.mjs";
import { getCityWeather } from "./cityWeather.mjs";


export async function cityCache(cityName, countryCode, stateCode = null) {
    console.log(`Fetching city from cache vs fresh data: ${cityName} (${countryCode})`);

    const storageKey = `${cityName}-${countryCode}-${stateCode || "NA"}`;
    const cachedData = JSON.parse(localStorage.getItem(storageKey));

    console.log(cachedData ? `Using cached city: ${cachedData.cityData.city}` : `Fetching fresh city data...`);

    if (cachedData && cachedData.timestamp) {
        const timeElapsed = Date.now() - cachedData.timestamp;
        const eightDaysInMs = 8 * 24 * 60 * 60 * 1000;

        if (timeElapsed < eightDaysInMs && cachedData.cityData.latitude && cachedData.cityData.longitude) {
            console.log(`Using cached city data for: ${cityName}`);
            return cachedData.cityData;
        } else {
            console.log(`Cached city data for ${cityName} is expired or missing lat/lon—fetching fresh data.`);
        }
    }

    console.log(`Fetching fresh city data for: ${cityName}`);
    const freshData = await getCityData(cityName, countryCode, stateCode);

    if (freshData) {
        localStorage.setItem(storageKey, JSON.stringify({ cityData: freshData, timestamp: Date.now() }));
        console.log(`Stored fresh city data for: ${cityName}`);
        return freshData;
    }

    return null;
}




export async function weatherCache(cityData) {
    console.log("Received cityData in weatherCache:", JSON.stringify(cityData, null, 2)); //Debug log

    if (!cityData || !cityData.city || !cityData.latitude || !cityData.longitude) {
        console.warn("Skipping weatherCache—invalid city data provided");
        return null;
    }

    const storageKey = `weather-${cityData.city}`;
    const cachedData = JSON.parse(sessionStorage.getItem(storageKey));

    const oneHourInMs = 60 * 60 * 1000;
    const needsRefresh = !cachedData || (Date.now() - cachedData.timestamp) >= oneHourInMs;

    

    if (needsRefresh) {
        if (!cachedData) {
            console.log(`No cached weather data found for ${cityData.city}—fetching fresh data.`);
        } else if ((Date.now() - cachedData.timestamp) >= oneHourInMs) {
            console.log(`Cached weather data for ${cityData.city} expired—fetching fresh data.`);
        }

        console.log(`Fetching fresh weather data for ${cityData.city}`);
        const freshData = await getCityWeather(cityData);
        if (freshData) {
            sessionStorage.setItem(storageKey, JSON.stringify({
                weatherData: freshData,
                timestamp: Date.now()
            }));
            console.log(`Stored fresh weather data for: ${cityData.city} (Timestamp: ${new Date().toLocaleString()})`);
        }
        return freshData;
    }

    return cachedData.weatherData;
}


