import axios from "axios";

const cache = {};

export const getCoordinates = async (address) => {
  try {
    // ✅ 1. Cache check
    if (cache[address]) {
      return cache[address];
    }

    // ✅ 2. API call
    const res = await axios.get(
      "http://localhost:3000/api/geocode",
      {
        params: {
          q: address,
        },
      }
    );

    if (!res.data || res.data.length === 0) return null;

    const coords = {
      lat: parseFloat(res.data[0].lat),
      lng: parseFloat(res.data[0].lon),
    };

    // ✅ 3. Cache save
    cache[address] = coords;

    return coords;

  } catch (err) {
    console.warn("Geocoding failed:", address);
    return null;
  }
};
// import axios from "axios";


// export const getCoordinates = async (address) => {
//   try {
//     const res = await axios.get(
//       "https://nominatim.openstreetmap.org/search",
//       {
//         params: {
//           q: address,
//           format: "json",
//           limit: 1,
//         },
//         // headers: {
//         //   "User-Agent": "college-project",
//         // },
//       }
//     );

//     if (!res.data || res.data.length === 0) return null;

//     return {
//       lat: parseFloat(res.data[0].lat),
//       lng: parseFloat(res.data[0].lon),
//     };
//   } catch (err) {
//     console.warn("Geocoding failed:", address);
//     return null;
//   }
// };
