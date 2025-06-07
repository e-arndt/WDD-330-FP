import { loadHeaderFooter } from "./utils.mjs";
import { getCityData } from "./citySearch.mjs"; // Import city search functionality
import { getRandomCity } from "./random.mjs";
import { generateCityDetails } from "./utils.mjs";

// Run on page load 
loadHeaderFooter();
populateCitiesDropdowns().then(() => {
    document.getElementById("start-city").addEventListener("change", handleStartCitySelection);
    document.getElementById("end-city").addEventListener("change", handleEndCitySelection);
});
 // dropdowns

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

    let cityData;
    try {
        document.getElementById("location-info").textContent = "Fetching city data...";

        // **Override API call for Paris**
        if (selectedCity.toLowerCase() === "paris" && selectedCountryCode.toUpperCase() === "FR") {
            console.log("Fetching Paris using WikiData ID Q90");

            const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?wikiDataId=Q90`;
            const options = {
                method: "GET",
                headers: {
                    "X-RapidAPI-Key": "YOUR_API_KEY",
                    "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
                }
            };

            const response = await fetch(url, options);
            const data = await response.json();

            if (data.data && data.data.length > 0) {
                cityData = data.data[0]; // Extract Paris data
            } else {
                console.error("Paris not found via WikiData ID Q90.");
                startCityResult.innerHTML = `<p>Error retrieving Paris data.</p>`;
                return;
            }
        } else {
            cityData = await getCityData(selectedCity, selectedCountryCode);
        }

        startCityResult.innerHTML = generateCityDetails(cityData, true);

        // **Reset the dropdown to allow selection again**
        startCitySelect.value = "";
        populateCitiesDropdowns();

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

        endCityResult.innerHTML = generateCityDetails(cityData, false); // Using template

    } catch (error) {
        console.error("Error fetching city data:", error);
        endCityResult.innerHTML = `<p>Error retrieving city data.</p>`;
    }
}


// Attach event listeners for city selection (AFTER populateCitiesDropdowns runs)
document.getElementById("search-start-city").addEventListener("input", async (event) => {
    const searchValue = event.target.value.trim();
    if (!searchValue.length) return;

    const cities = await getCityData(searchValue);
    console.log("API Response:", cities); // Check if cities array has data

    if (cities && cities.length > 0) {
        chooseCityDropdown("start-multi-result", cities);
    } else {
        console.error("No cities found for:", searchValue);
    }
});


document.getElementById("random-start-city").addEventListener("click", () => {
    getRandomCity("start-city-result"); // Display results in start city section
});

document.getElementById("random-end-city").addEventListener("click", () => {
    getRandomCity("end-city-result"); // Display results in end city section
});


document.getElementById("search-end-city").addEventListener("input", async (event) => {
    const searchValue = event.target.value.trim();
    if (!searchValue.length) return;

    const cities = await getCityData(searchValue);

    if (cities) {
        chooseCityDropdown("end-multi-result", cities);
    }
});

