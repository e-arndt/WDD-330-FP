import { weatherCache } from "./cache.mjs";
import { generateCityWeather } from "./cityWeather.mjs";


function updateCopyrightYear() {
    const yearElement = document.querySelector("#copyright-year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

function updateHeaderImage() {
    const hour = new Date().getHours();
    const headerLogo = document.querySelector(".logo");

    if (!headerLogo) return;

    let imageSrc = "./images/City-Skyline-sm.png"; // Default to daytime skyline

    if (hour < 6 || hour >= 21) {
        imageSrc = "./images/City-Skyline-night.png"; // Nighttime skyline
    }

    headerLogo.src = imageSrc;
}


function updateCityIcon() {
    const hour = new Date().getHours();
    const footer = document.querySelector("#footer");

    if (!footer) return;

    let icon = "🏙️"; // default: daytime

    if (hour >= 5 && hour < 10) {
        icon = "🌇"; // sunrise
    } else if (hour >= 10 && hour < 19) {
        icon = "🏙️"; // daytime
    } else if (hour >= 19 && hour < 21) {
        icon = "🌆"; // dusk
    } else {
        icon = "🌃"; // night
    }

    footer.innerHTML = footer.innerHTML.replace(/🌇|🌆|🌃|🏙️/g, icon);
}


export function renderWithTemplate(template, parentElement, callback) {
    parentElement.innerHTML = template;
    if (callback) {
        callback(); // Callback runs after the footer loads
    }
}



export async function loadTemplate(path) {
    const res = await fetch(path);
    const template = await res.text();
    return template;
  }


export async function loadHeaderFooter() {
    const headerTemplate = await loadTemplate("./header.html");
    const headerElement = document.querySelector("#main-header");
    renderWithTemplate(headerTemplate, headerElement, () => {
        updateHeaderImage();
    });

    const footerTemplate = await loadTemplate("./footer.html");
    const footerElement = document.querySelector("#footer");
    renderWithTemplate(footerTemplate, footerElement, () => {
        updateCopyrightYear();
        updateCityIcon();
    });
    
}


export function generateCityDetails(cityData, isStartCity = true, otherCityData = null) {
    if (!cityData) return `<p>City data not found.</p>`;

    const stateOrRegion = cityData.countryCode === "US" ? cityData.state : "";
    const flagPath = `./images/flags/${cityData.countryCode.toLowerCase()}.svg`;
    const distance = otherCityData ? determineDistance(cityData, otherCityData) : "0 miles";

    const detailsHtml = `
        <h2>${isStartCity ? "Starting" : "Ending"} City Details</h2>
        <p>City: ${cityData.city}${stateOrRegion ? ", " + stateOrRegion : ""}</p>
        <p>Country: ${cityData.country}</p>
        <p>Population: ${cityData.population ? cityData.population.toLocaleString() : "N/A"}</p>
        <p>Distance between cities: ${distance}</p>
        <img src="${flagPath}" alt="${cityData.country}" class="flag">
        <div class="${isStartCity ? "start-city-wx" : "end-city-wx"}"></div>`;

    // **Return the generated HTML string**
    return detailsHtml;
}

export function updateCityWeather(cityData, isStartCity) {
    setTimeout(async () => {
        const cachedWeather = await weatherCache(cityData.city);
        if (cachedWeather) {
            generateCityWeather(cityData, isStartCity);
        } else {
            console.warn(`Weather data unavailable for ${cityData.city}`);
        }
    }, 100);
}




export function determineDistance(cityData1, cityData2) {
    if (!cityData1 || !cityData2) return "0 miles"; // If only one city is selected

    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const R = 3958.8; // Earth's radius in miles
    const lat1 = toRadians(cityData1.latitude);
    const lon1 = toRadians(cityData1.longitude);
    const lat2 = toRadians(cityData2.latitude);
    const lon2 = toRadians(cityData2.longitude);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    return `${distance.toFixed(2)} miles`;
}


