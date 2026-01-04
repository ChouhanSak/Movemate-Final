import axios from "axios";


export const getCoordinates = async (address) => {
  try {
    const res = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: address,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "college-project",
        },
      }
    );

    if (!res.data || res.data.length === 0) return null;

    return {
      lat: parseFloat(res.data[0].lat),
      lng: parseFloat(res.data[0].lon),
    };
  } catch (err) {
    console.warn("Geocoding failed:", address);
    return null;
  }
};
