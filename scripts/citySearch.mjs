// Exported function for fetching city data
export async function getCityData(city, countryCode = "", stateCode = null) {
    city = city.trim(); // Prevent unnecessary API calls with empty spaces
    if (!city.length) return []; // Ensure valid input

    const apiKey = "2f3e9979b7mshdc0da415a1c7fdcp1c71ffjsn4d8ada5f3148";

    // Base API URL
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
        console.log("API Raw Response:", data);

        if (!data.data || data.data.length === 0) {
            console.error(`No valid cities found for ${city}, ${stateCode ? stateCode + ", " : ""}${countryCode}`);
            return null;
        }

    
        // Filter cities by name and state (if provided)
        const filteredCities = data.data.filter(entry =>
            entry.type === "CITY" &&
            entry.city.toLowerCase().includes(city.toLowerCase()) &&
            (!stateCode || entry.regionCode === stateCode)
        );

        console.log("Filtered Cities Data:", filteredCities);

        // Sort the filtered cities by population (highest first) and select the top result.
        const matchedCity = filteredCities.length
            ? filteredCities.sort((a, b) => (b.population || 0) - (a.population || 0))[0]
            : null;



        if (!matchedCity) {
            console.error("No exact match found for the selected city.");
            return null;
        }

        console.log("Matched City Data:", matchedCity);

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
        return [];
    }
}


