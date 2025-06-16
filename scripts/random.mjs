import { cityCache } from "./cache.mjs";
import { generateCityDetails } from "./utils.mjs";
import { generateCityWeather } from "./cityWeather.mjs";
import { weatherCache } from "./cache.mjs";

let startCityData = null;
let endCityData = null;

/* Selects a random city from a predefined JSON list and updates the UI */
export async function getRandomCity(targetElementId) {
    try {
        const response = await fetch("./json/popular-cities.json");
        const data = await response.json();
        const cities = [...data.popularCities.USA, ...data.popularCities.International];

        if (!cities.length) {
            console.error("No cities available in JSON!");
            return;
        }

        const randomIndex = Math.floor(Math.random() * cities.length);
        const randomCity = cities[randomIndex];

        // Determines if the random city is a start city or end city based on the target element ID
        const isStartCity = targetElementId.includes("start");

        console.log(isStartCity ? `Start City Random: ${randomCity.city}` : `End City Random: ${randomCity.city}`);

        // Retrieves city data, either from cache or by fetching fresh data
        const cityData = await cityCache(randomCity.city, randomCity.countryCode);
        if (!cityData) {
            console.error("Failed to retrieve data for the random city.");
            return;
        }

        // Updates stored city data and session storage accordingly
        if (isStartCity) {
            startCityData = cityData;
            sessionStorage.setItem("startCityData", JSON.stringify(cityData));
            const storedEnd = sessionStorage.getItem("endCityData");
            endCityData = storedEnd ? JSON.parse(storedEnd) : null;
        } else {
            endCityData = cityData;
            sessionStorage.setItem("endCityData", JSON.stringify(cityData));
            const storedStart = sessionStorage.getItem("startCityData");
            startCityData = storedStart ? JSON.parse(storedStart) : null;
        }

        // Updates the UI with city details
        document.querySelector(`.${targetElementId}`).innerHTML = generateCityDetails(
            cityData,
            isStartCity,
            isStartCity ? endCityData : startCityData
        );

        // Fetches weather data asynchronously after a brief delay
        setTimeout(async () => {
            const cachedWeather = await weatherCache(cityData);
            generateCityWeather(cityData, isStartCity);

            // Ensures weather updates for both selected cities
            if (startCityData && endCityData) {
                generateCityWeather(isStartCity ? endCityData : startCityData, !isStartCity);
            }
        }, 100);

        // Updates city details for both start and end cities if available
        if (startCityData && endCityData) {
            document.querySelector(".start-city-result").innerHTML = generateCityDetails(startCityData, true, endCityData);
            document.querySelector(".end-city-result").innerHTML = generateCityDetails(endCityData, false, startCityData);
        }
    } catch (error) {
        console.error("Error fetching random city data:", error);
    }
}
