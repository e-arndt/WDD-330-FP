import { weatherCache } from "./cache.mjs";

export async function getCityWeather(cityData) {
    if (!cityData || !cityData.latitude || !cityData.longitude) {
        console.error(`Invalid city data passed to getCityWeather:`, cityData);
        return null;
    }

    const apiKey = "f1999393ce294ea3bf8185645252005";
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${cityData.latitude},${cityData.longitude}`;

    console.log(`Attempting API call: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Weather API response:", data);

        // **Return the correct city and country associated with lat/lon**
        return {
            city: cityData.city,  // Pass original city name from cityData
            country: cityData.country,  // Preserve the correct country info
            condition: data.current.condition.text,
            humidity: data.current.humidity,
            tempF: data.current.temp_f,
            windDir: data.current.wind_dir,
            windMPH: data.current.wind_mph,
            pressure: data.current.pressure_in,
            rain: data.current.precip_in,
            icon: `https:${data.current.condition.icon}`
        };
    } catch (error) {
        console.error("Error fetching weather data:", error);
        return null;
    }
}




export async function generateCityWeather(cityData, isStartCity = true, retryCount = 0) {
    if (!cityData || !cityData.latitude || !cityData.longitude) {
        console.warn(`Skipping weather retrieval—lat/lon missing for ${cityData?.city}`);

        let weatherDiv = document.querySelector(`.${isStartCity ? "start-city-wx" : "end-city-wx"}`);
        if (weatherDiv) {
            weatherDiv.innerHTML = `<p>Weather data unavailable.</p>`;
        }
        return;
    }

    console.log(`Initializing weather retrieval for: ${cityData.city}`);

    let weatherDiv = document.querySelector(`.${isStartCity ? "start-city-wx" : "end-city-wx"}`);

    // Make sure weatherDiv exists before proceeding
    if (!weatherDiv) {
        if (retryCount < 5) {
            console.warn("Weather div not found, retrying...");
            setTimeout(() => generateCityWeather(cityData, isStartCity, retryCount + 1), 100);
            return;
        }
        console.warn(`Weather div not found after ${retryCount} retries.`);
        return;
    }

    try {
        console.log(`Checking cached weather for ${cityData.city}`);
        const weatherData = await weatherCache(cityData);  // Fetch cached or fresh weather

        console.log(weatherData
            ? `Using cached weather data for: ${cityData.city}`
            : `Fetching fresh weather data for: ${cityData.city}`);

        if (!weatherData) {
            console.error("Weather data is null or undefined");
            weatherDiv.innerHTML = `<p>Weather data unavailable.</p>`;
            return;
        }

        // Insert weather data into the UI
        weatherDiv.innerHTML = `
            <p>Current Conditions: ${weatherData.condition}</p>
            <p>Atmospheric Pressure: ${weatherData.pressure}<span style="display: inline-block; width: 1.2rem;"></span>Rainfall ${weatherData.rain} in</p>
            <p>Humidity: ${weatherData.humidity}%<span style="display: inline-block; width: 1.2rem;"></span>Temperature: ${weatherData.tempF}°F</p>
            <p>Wind: ${weatherData.windDir}<span style="display: inline-block; width: .25rem;"></span>at ${weatherData.windMPH} mph</p>
            <img src="${weatherData.icon}" alt="${weatherData.condition}">`;
        
        
    } catch (error) {
        console.error("Error fetching weather data:", error);
        weatherDiv.innerHTML = `<p>Weather data unavailable.</p>`;
    }
}


