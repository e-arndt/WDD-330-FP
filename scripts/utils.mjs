function updateCopyrightYear() {
    const yearElement = document.querySelector("#copyright-year");
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}


export function renderWithTemplate(template, parentElement, callback) {
    parentElement.innerHTML = template;
    if (callback) {
        callback(); // Ensure the callback runs after the footer loads
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
    renderWithTemplate(headerTemplate, headerElement);

    const footerTemplate = await loadTemplate("./footer.html");
    const footerElement = document.querySelector("#footer");
    renderWithTemplate(footerTemplate, footerElement, updateCopyrightYear);
}


export function generateCityDetails(cityData, isStartCity = true) {
    if (!cityData) return `<p>City data not found.</p>`;

    // Construct local flag path based on country code
    const flagPath = `/images/flags/${cityData.countryCode.toLowerCase()}.svg`;

    return `
        <h2>${isStartCity ? "Starting" : "Ending"} City Details</h2>
        <p>City: ${cityData.city}, ${cityData.state}</p>
        <p>Country: ${cityData.country}</p>
        <p>Latitude: ${cityData.latitude}</p>
        <p>Longitude: ${cityData.longitude}</p>
        <p>Population: ${cityData.population ? cityData.population.toLocaleString() : "N/A"}</p>
        <img src="${flagPath}" alt="${cityData.country} flag" class="flag">`;
}


