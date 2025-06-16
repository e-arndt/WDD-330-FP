import { loadHeaderFooter } from "./utils.mjs";
import { getRandomCity } from "./random.mjs";
import { generateCityDetails } from "./utils.mjs";
import { generateCityWeather } from "./cityWeather.mjs";
import { cityCache } from "./cache.mjs";

// Runs when the page loads, inserting header/footer and setting up event listeners
loadHeaderFooter();
populateCitiesDropdowns().then(() => {
    document.getElementById("start-city").addEventListener("change", handleStartCitySelection);
    document.getElementById("end-city").addEventListener("change", handleEndCitySelection);

    // Ensures weather updates after city selection
    setTimeout(() => {
        if (startCityData) generateCityWeather(startCityData, true);
        if (endCityData) generateCityWeather(endCityData, false);
    }, 100);
});

/* Populates a given dropdown with cities, automatically selecting the first match */
function chooseCityDropdown(dropdownId, cities) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = ""; // Clears previous results

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

    dropdown.selectedIndex = 0; // Automatically selects the first city
}

/* Loads city data from a JSON file and populates dropdowns */
async function populateCitiesDropdowns() {
    try {
        const response = await fetch("./json/popular-cities.json");
        const data = await response.json();

        const startDropdown = document.getElementById("start-city");
        const endDropdown = document.getElementById("end-city");

        // Adds default "Choose a City" option
        const defaultOptionStart = document.createElement("option");
        defaultOptionStart.value = "";
        defaultOptionStart.textContent = "Choose a City";
        startDropdown.appendChild(defaultOptionStart);

        const defaultOptionEnd = document.createElement("option");
        defaultOptionEnd.value = "";
        defaultOptionEnd.textContent = "Choose a City";
        endDropdown.appendChild(defaultOptionEnd);

        // Sorts cities alphabetically before inserting them into dropdowns
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

/* Handles selection of a starting city and updates session storage */
async function handleStartCitySelection() {
    const startCitySelect = document.getElementById("start-city");
    const selectedValue = startCitySelect.value;
    if (!selectedValue) return;

    const [selectedCity, selectedCountryCode, selectedStateCode] = selectedValue.split("|");
    const safeStateCode = selectedStateCode && selectedStateCode !== "null" ? selectedStateCode : null;

    console.log(`Previous Start City:`, startCityData);
    console.log(`Previous End City:`, endCityData);

    // Removes outdated cache and fetches new city data
    localStorage.removeItem(`${selectedCity}-${selectedCountryCode}-${safeStateCode || "NA"}`);
    startCityData = await cityCache(selectedCity, selectedCountryCode, safeStateCode);

    // Saves updated start city data in session storage
    sessionStorage.setItem("startCityData", JSON.stringify(startCityData));

    // Loads stored end city data if available
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

/* Handles selection of an ending city and updates session storage */
async function handleEndCitySelection() {
    const endCitySelect = document.getElementById("end-city");
    const selectedValue = endCitySelect.value;
    if (!selectedValue) return;

    const [selectedCity, selectedCountryCode, selectedStateCode] = selectedValue.split("|");
    const safeStateCode = selectedStateCode && selectedStateCode !== "null" ? selectedStateCode : null;

    console.log(`Previous Start City:`, startCityData);
    console.log(`Previous End City:`, endCityData);

    // Removes outdated cache and fetches new city data
    localStorage.removeItem(`${selectedCity}-${selectedCountryCode}-${safeStateCode || "NA"}`);
    endCityData = await cityCache(selectedCity, selectedCountryCode, safeStateCode);

    // Saves updated end city data in session storage
    sessionStorage.setItem("endCityData", JSON.stringify(endCityData));

    // Loads stored start city data if available
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

// Event listeners for selecting random cities
document.getElementById("random-start-city").addEventListener("click", () => {
    getRandomCity("start-city-result"); // Displays results in start city section
});

document.getElementById("random-end-city").addEventListener("click", () => {
    getRandomCity("end-city-result"); // Displays results in end city section
});
