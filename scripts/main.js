import { loadHeaderFooter } from "./utils.mjs";
import { getCityData } from "./citySearch.mjs"; // Import city search functionality

// Run on page load 
loadHeaderFooter();
populateCitiesDropdowns(); // dropdowns

function chooseCityDropdown(dropdownId, cities) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = ""; // Clear previous results

    if (cities.length === 0) {
        dropdown.innerHTML = `<option value="">No matches found</option>`;
        return;
    }

    cities.forEach(city => {
        const option = document.createElement("option");
        option.value = `${city.city}|${city.countryCode}`;
        option.textContent = `${city.city}, ${city.country}`;
        dropdown.appendChild(option);
    });
}


// Function to populate dropdowns with city data from JSON (UNCHANGED)
async function populateCitiesDropdowns() {
    try {
        const response = await fetch("./json/popular-cities.json");
        const data = await response.json();

        const startDropdown = document.getElementById("start-city");
        const endDropdown = document.getElementById("end-city");

        // Create default options
        const defaultOptionStart = document.createElement("option");
        defaultOptionStart.value = "";
        defaultOptionStart.textContent = "-- Choose a city --";
        startDropdown.appendChild(defaultOptionStart);

        const defaultOptionEnd = document.createElement("option");
        defaultOptionEnd.value = "";
        defaultOptionEnd.textContent = "-- Choose a city --";
        endDropdown.appendChild(defaultOptionEnd);

        // Merge and sort cities alphabetically
        const sortedCities = [...data.popularCities.USA, ...data.popularCities.International]
            .sort((a, b) => a.city.localeCompare(b.city));

        sortedCities.forEach(cityObj => {
            const optionStart = document.createElement("option");
            optionStart.value = `${cityObj.city}|${cityObj.countryCode}`; // Store city & countryCode
            optionStart.textContent = `${cityObj.city}, ${cityObj.country}`; // Display only city & country
            startDropdown.appendChild(optionStart);

            const optionEnd = document.createElement("option");
            optionEnd.value = `${cityObj.city}|${cityObj.countryCode}`;
            optionEnd.textContent = `${cityObj.city}, ${cityObj.country}`;
            endDropdown.appendChild(optionEnd);
        });
    } catch (error) {
        console.error("Error loading cities:", error);
    }
}

// Function to handle START city selection and fetch data
async function handleStartCitySelection() {
    const startCitySelect = document.getElementById("start-city");
    const startCityResult = document.querySelector(".start-city-result");

    const selectedValue = startCitySelect.value;
    if (!selectedValue) return;

    const [selectedCity, selectedCountryCode] = selectedValue.split("|");
    console.log("Selected Value:", selectedValue);
    console.log("Split Values:", selectedCity, selectedCountryCode);


    try {
        document.getElementById("location-info").textContent = "Fetching city data...";
        const cityData = await getCityData(selectedCity, selectedCountryCode);

        if (!cityData) {
            startCityResult.innerHTML = `<p>City data not found.</p>`;
            return;
        }

        startCityResult.innerHTML = `
            <h2>Starting City Details</h2>
            <p>City: ${cityData.city}</p>
            <p>Country: ${cityData.country}</p>
            <p>Latitude: ${cityData.latitude}</p>
            <p>Longitude: ${cityData.longitude}</p>
            <img src="https://flagsapi.com/${cityData.countryCode}/flat/64.png" alt="${cityData.country} flag">`;
    } catch (error) {
        console.error("Error fetching city data:", error);
        startCityResult.innerHTML = `<p>Error retrieving city data.</p>`;
    }
}

// Function to handle END city selection and fetch data
async function handleEndCitySelection() {
    const endCitySelect = document.getElementById("end-city");
    const endCityResult = document.querySelector(".end-city-result");

    const selectedValue = endCitySelect.value;
    if (!selectedValue) return;

    const [selectedCity, selectedCountryCode] = selectedValue.split("|");

    try {
        document.getElementById("location-info").textContent = "Fetching city data...";
        const cityData = await getCityData(selectedCity, selectedCountryCode);

        if (!cityData) {
            endCityResult.innerHTML = `<p>City data not found.</p>`;
            return;
        }

        endCityResult.innerHTML = `
            <h2>Ending City Details</h2>
            <p>City: ${cityData.city}</p>
            <p>Country: ${cityData.country}</p>
            <p>Latitude: ${cityData.latitude}</p>
            <p>Longitude: ${cityData.longitude}</p>
            <img src="https://flagsapi.com/${cityData.countryCode}/flat/64.png" alt="${cityData.country} flag">`;
    } catch (error) {
        console.error("Error fetching city data:", error);
        endCityResult.innerHTML = `<p>Error retrieving city data.</p>`;
    }
}

// Attach event listeners for city selection (AFTER populateCitiesDropdowns runs)
document.getElementById("start-city").addEventListener("change", handleStartCitySelection);
document.getElementById("end-city").addEventListener("change", handleEndCitySelection);

// Attach event listeners for city search inputs (handles API calls)
document.getElementById("search-start-city").addEventListener("input", async (event) => {
    const searchValue = event.target.value.trim();
    if (!searchValue.length) return; // Ensure no empty inputs

    const cities = await getCityData(searchValue);
    chooseCityDropdown("start-multi-result", cities); // function call
});

document.getElementById("search-end-city").addEventListener("input", async (event) => {
    const searchValue = event.target.value.trim();
    if (!searchValue) return;

    const cities = await getCityData(searchValue);
    chooseCityDropdown("end-multi-result", cities); // function call
});

