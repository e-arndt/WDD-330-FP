// Exported function for fetching city data
export async function getCityData(city, countryCode = "") {
    city = city.trim(); // Prevent unnecessary API calls with empty spaces
    if (!city.length) return []; // Ensure valid input

    const apiKey = "2f3e9979b7mshdc0da415a1c7fdcp1c71ffjsn4d8ada5f3148";
    const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${city}&countryIds=${countryCode}`;
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
            console.error("No valid cities returned from API.");
            return null;
        }

        // **Filter only actual city results**
        const filteredCities = data.data.filter(entry => entry.type === "CITY");
        console.log("Filtered Cities Data:", filteredCities);

        // **Find exact match**
        const matchedCity = filteredCities.find(c => c.city.toLowerCase() === city.toLowerCase());

        if (!matchedCity) {
            console.error("No exact match found for the selected city.");
            return null;
        }

        console.log("Matched City Data:", matchedCity);

        return {
            city: matchedCity.city,
            country: matchedCity.country,
            countryCode: matchedCity.countryCode,
            latitude: matchedCity.latitude,
            longitude: matchedCity.longitude
        };
        
    } catch (error) {
        console.error("API fetch error:", error);
        return [];
    }
}

