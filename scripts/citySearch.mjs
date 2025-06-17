// Fetches city data from an external API based on city name, country, and optional state code
export async function getCityData(city, countryCode = "", stateCode = null) {
    city = city.trim(); // Prevent unnecessary API calls with empty spaces
    if (!city.length) return []; // Ensure valid input

    const apiKey = "2f3e9979b7mshdc0da415a1c7fdcp1c71ffjsn4d8ada5f3148";

    // Constructs the base API URL for city lookup
    let url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${city}&countryIds=${countryCode}`;

    // **Include state code in query when applicable**
    if (stateCode) {
        url += `&adminDivisionCode=${stateCode}`;
    }

    const options = {
        method: "GET",
        headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        // console.log("API Raw Response Data:", JSON.stringify(data.data, null, 2));

        if (!data.data || data.data.length === 0) {
            console.error(`No valid cities found for ${city}, ${stateCode ? stateCode + ", " : ""}${countryCode}`);
            return null;
        }

        // Filters results to select the city that best matches the desired result
        const filteredCities = data.data.filter(entry =>
            entry.type === "CITY" &&
            entry.city.toLowerCase().includes(city.toLowerCase()) &&
            (!stateCode || entry.regionCode === stateCode)
        );

        // console.log("Filtered Cities Before Sorting:", JSON.stringify(filteredCities, null, 2));

        // Sorts the filtered cities by population (highest first) and selects the most relevant match
        const matchedCity = filteredCities.length
            ? filteredCities.sort((a, b) => (b.population || 0) - (a.population || 0))[0]
            : null;

        if (!matchedCity.latitude || !matchedCity.longitude) {
            console.error("Latitude/Longitude missing from matched city data.");
            return {};
        }

        console.log("Latitude/Longitude Verification:", matchedCity.latitude, matchedCity.longitude);
        console.log("Matched City Data:", matchedCity);

        // Returns key city data including name, location, and population
        return {
            city: matchedCity.city,
            state: matchedCity.regionCode,
            country: matchedCity.country,
            countryCode: matchedCity.countryCode,
            latitude: matchedCity.latitude,
            longitude: matchedCity.longitude,
            population: matchedCity.population || "N/A"
        };

    } catch (error) {
        console.error("API fetch error:", error);
        return null;
    }
}
