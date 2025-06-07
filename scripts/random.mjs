import { getCityData } from "./citySearch.mjs"; // Import API function
import { generateCityDetails } from "./utils.mjs";

export async function getRandomCity(targetElementId, isStartCity) {
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

        // Use `generateCityDetails` function to format output
        document.querySelector(`.${targetElementId}`).innerHTML = generateCityDetails(cityData, isStartCity);
    } catch (error) {
        console.error("Error fetching random city data:", error);
    }
}
