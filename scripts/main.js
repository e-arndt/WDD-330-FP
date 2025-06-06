import { loadHeaderFooter } from "./utils.mjs";

// Run on page load
loadHeaderFooter();

async function populateCitiesDropdowns() {
    try {
        // Fetch JSON from the correct folder path
        const response = await fetch("./json/popular-cities.json");
        const data = await response.json();

        // Select both dropdowns
        const startDropdown = document.getElementById("start-city");
        const endDropdown = document.getElementById("end-city");

        // Create a default option for each dropdown
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

        // Add cities to both dropdowns
        sortedCities.forEach(cityObj => {
            const optionStart = document.createElement("option");
            optionStart.value = cityObj.city.toLowerCase().replace(/\s+/g, "-");
            optionStart.textContent = `${cityObj.city}, ${cityObj.country}`;
            startDropdown.appendChild(optionStart);

            const optionEnd = document.createElement("option");
            optionEnd.value = cityObj.city.toLowerCase().replace(/\s+/g, "-");
            optionEnd.textContent = `${cityObj.city}, ${cityObj.country}`;
            endDropdown.appendChild(optionEnd);
        });
    } catch (error) {
        console.error("Error loading cities:", error);
    }
}

// Call the function on page load
populateCitiesDropdowns();



