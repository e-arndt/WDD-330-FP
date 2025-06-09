import { getCityData } from "./citySearch.mjs";
import { generateCityDetails } from "./utils.mjs";

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

        // Pick a random city
        const randomIndex = Math.floor(Math.random() * cities.length);
        const randomCity = cities[randomIndex];

        console.log("Randomly Selected City:", randomCity);

        // Fetch detailed data for the selected city
        const cityData = await getCityData(randomCity.city, randomCity.countryCode);

        if (!cityData) {
            console.error("Failed to retrieve API data for the random city.");
            return;
        }

        // Determine if this is the START or END city based on targetElementId
        const isStart = targetElementId.includes("start");

        // Store city data globally
        if (isStart) {
            startCityData = cityData;
        } else {
            endCityData = cityData;
        }

        // Update details with distance calculation
        document.querySelector(`.${targetElementId}`).innerHTML = generateCityDetails(
            cityData,
            isStart,
            isStart ? endCityData : startCityData // Pass the other city for distance
        );

        // Refresh the other city’s details to reflect updated distance
        if (startCityData && endCityData) {
            document.querySelector(".start-city-result").innerHTML = generateCityDetails(startCityData, true, endCityData);
            document.querySelector(".end-city-result").innerHTML = generateCityDetails(endCityData, false, startCityData);
        }
    } catch (error) {
        console.error("Error fetching random city data:", error);
    }
}
