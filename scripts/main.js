import { loadHeaderFooter } from "./utils.mjs";
import { getCityData } from "./citySearch.mjs"; // Import city search functionality
import { getRandomCity } from "./random.mjs";
import { generateCityDetails } from "./utils.mjs";
import { generateCityWeather } from "./cityWeather.mjs";
import { cityCache } from "./cache.mjs";
import { weatherCache } from "./cache.mjs";
import { determineDistance } from "./utils.mjs";



// Run on page load 
loadHeaderFooter();
populateCitiesDropdowns().then(() => {
    document.getElementById("start-city").addEventListener("change", handleStartCitySelection);
    document.getElementById("end-city").addEventListener("change", handleEndCitySelection);

    // Ensure weather updates after city selection
    setTimeout(() => {
        if (startCityData) generateCityWeather(startCityData, true);
        if (endCityData) generateCityWeather(endCityData, false);
    }, 100);
    
});


function chooseCityDropdown(dropdownId, cities) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = ""; // Clear previous results

    if (!cities || cities.length === 0) {
        dropdown.innerHTML = `<option value="">No matches found</option>`;
        return;
    }

    cities.forEach(city => {
        const option = document.createElement("option");
        option.value = `${city.city}|${city.countryCode}`;
        option.textContent = `${city.city}, ${city.country}`;
        dropdown.appendChild(option);
    });

    // Automatically select the first city (optional)
    dropdown.selectedIndex = 0;
}



// Function to populate dropdowns with city data from JSON (UNCHANGED)
async function populateCitiesDropdowns() {
    try {
        const response = await fetch("./json/popular-cities.json");
        const data = await response.json();

        const startDropdown = document.getElementById("start-city");
        const endDropdown = document.getElementById("end-city");

        const defaultOptionStart = document.createElement("option");
        defaultOptionStart.value = "";
        defaultOptionStart.textContent = "-- Choose a city --";
        startDropdown.appendChild(defaultOptionStart);

        const defaultOptionEnd = document.createElement("option");
        defaultOptionEnd.value = "";
        defaultOptionEnd.textContent = "-- Choose a city --";
        endDropdown.appendChild(defaultOptionEnd);

        const sortedCities = [...data.popularCities.USA, ...data.popularCities.International]
            .sort((a, b) => a.city.localeCompare(b.city));

        sortedCities.forEach((cityObj) => {
            const optionStart = document.createElement("option");
            optionStart.value = `${cityObj.city}|${cityObj.countryCode}`;
            optionStart.textContent = `${cityObj.city}, ${cityObj.country}`;
            startDropdown.appendChild(optionStart);

            const optionEnd = document.createElement("option");
            optionEnd.value = `${cityObj.city}|${cityObj.countryCode}`;
            optionEnd.textContent = `${cityObj.city}, ${cityObj.country}`;
            endDropdown.appendChild(optionEnd);
        });

        console.log("Dropdowns populated. City data will be fetched only upon selection.");
    } catch (error) {
        console.error("Error loading cities:", error);
    }
}



let startCityData = null;
let endCityData = null;

async function handleStartCitySelection() {
    const startCitySelect = document.getElementById("start-city");
    const selectedValue = startCitySelect.value;
    if (!selectedValue) return;

    const [selectedCity, selectedCountryCode, selectedStateCode] = selectedValue.split("|");

    // Ensure stateCode is correctly handled for international cities
    const safeStateCode = selectedStateCode && selectedStateCode !== "null" ? selectedStateCode : null;

    console.log(`Previous Start City:`, startCityData);
    console.log(`Previous End City:`, endCityData);

    localStorage.removeItem(`${selectedCity}-${selectedCountryCode}-${safeStateCode || "NA"}`);
    startCityData = await cityCache(selectedCity, selectedCountryCode, safeStateCode);

    // Write the new start city data to session storage
    sessionStorage.setItem("startCityData", JSON.stringify(startCityData));

    // Load the end city data from session storage (if any)
    const storedEnd = sessionStorage.getItem("endCityData");
    endCityData = storedEnd ? JSON.parse(storedEnd) : null;

    document.getElementById("start-city").selectedIndex = 0;


    console.log(`Updated Start City:`, startCityData);
    console.log(`Updated End City:`, endCityData);

    document.querySelector(".start-city-result").innerHTML = generateCityDetails(startCityData, true, endCityData);
    if (endCityData) {
        document.querySelector(".end-city-result").innerHTML = generateCityDetails(endCityData, false, startCityData);
    }

    generateCityWeather(startCityData, true);
    if (endCityData) generateCityWeather(endCityData, false);
}


async function handleEndCitySelection() {
    const endCitySelect = document.getElementById("end-city");
    const selectedValue = endCitySelect.value;
    if (!selectedValue) return;

    const [selectedCity, selectedCountryCode, selectedStateCode] = selectedValue.split("|");

    // Ensure stateCode is correctly handled
    const safeStateCode = selectedStateCode && selectedStateCode !== "null" ? selectedStateCode : null;

    console.log(`Previous Start City:`, startCityData);
    console.log(`Previous End City:`, endCityData);

    localStorage.removeItem(`${selectedCity}-${selectedCountryCode}-${safeStateCode || "NA"}`);
    endCityData = await cityCache(selectedCity, selectedCountryCode, safeStateCode);

    // Write the new end city data to session storage
    sessionStorage.setItem("endCityData", JSON.stringify(endCityData));

    // Load the start city data from session storage (if any)
    const storedStart = sessionStorage.getItem("startCityData");
    startCityData = storedStart ? JSON.parse(storedStart) : null;

    document.getElementById("end-city").selectedIndex = 0;


    console.log(`Updated Start City:`, startCityData);
    console.log(`Updated End City:`, endCityData);

    document.querySelector(".end-city-result").innerHTML = generateCityDetails(endCityData, false, startCityData);
    if (startCityData) {
        document.querySelector(".start-city-result").innerHTML = generateCityDetails(startCityData, true, endCityData);
    }

    generateCityWeather(endCityData, false);
    if (startCityData) generateCityWeather(startCityData, true);
}


document.getElementById("random-start-city").addEventListener("click", () => {
    getRandomCity("start-city-result"); // Display results in start city section
});

document.getElementById("random-end-city").addEventListener("click", () => {
    getRandomCity("end-city-result"); // Display results in end city section
});

