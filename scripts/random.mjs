import { cityCache } from "./cache.mjs";
import { generateCityDetails } from "./utils.mjs";
import { generateCityWeather } from "./cityWeather.mjs";
import { weatherCache } from "./cache.mjs";

let startCityData = null;
let endCityData = null;

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

        const isStartCity = targetElementId.includes("start"); // Declare first

        console.log(isStartCity ? `Start City Random: ${randomCity.city}` : `End City Random: ${randomCity.city}`); // Log AFTER declaration

        const cityData = await cityCache(randomCity.city, randomCity.countryCode);
        if (!cityData) {
            console.error("Failed to retrieve data for the random city.");
            return;
        }

        if (isStartCity) {
            startCityData = cityData;
            sessionStorage.setItem("startCityData", JSON.stringify(cityData));
            // Load the end city data from session storage (if any)
            const storedEnd = sessionStorage.getItem("endCityData");
            endCityData = storedEnd ? JSON.parse(storedEnd) : null;
        } else {
            endCityData = cityData;
            sessionStorage.setItem("endCityData", JSON.stringify(cityData));
            // Load the start city data from session storage (if any)
            const storedStart = sessionStorage.getItem("startCityData");
            startCityData = storedStart ? JSON.parse(storedStart) : null;
        }
        

        document.querySelector(`.${targetElementId}`).innerHTML = generateCityDetails(
            cityData,
            isStartCity,
            isStartCity ? endCityData : startCityData
        );

        setTimeout(async () => {
            const cachedWeather = await weatherCache(cityData);
            generateCityWeather(cityData, isStartCity);

            if (startCityData && endCityData) {
                generateCityWeather(isStartCity ? endCityData : startCityData, !isStartCity);
            }
        }, 100);

        if (startCityData && endCityData) {
            document.querySelector(".start-city-result").innerHTML = generateCityDetails(startCityData, true, endCityData);
            document.querySelector(".end-city-result").innerHTML = generateCityDetails(endCityData, false, startCityData);
        }
    } catch (error) {
        console.error("Error fetching random city data:", error);
    }
}



