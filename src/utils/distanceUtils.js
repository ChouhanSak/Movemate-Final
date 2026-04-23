import axios from "axios";

// ✅ Proper cache (not skip)
const distanceCache = {};

export const calculateDistance = async (start, end) => {
  const key = `${start.lat},${start.lng}-${end.lat},${end.lng}`;

  // ✅ RETURN FROM CACHE (not null)
  if (distanceCache[key]) {
    console.log("Distance from cache");
    return distanceCache[key];
  }

  try {
    console.log("Calling API for distance...");

    const res = await axios.get("http://localhost:3000/api/distance", {
      params: {
        startLat: start.lat,
        startLng: start.lng,
        endLat: end.lat,
        endLng: end.lng,
      },
    });

    const distance = parseFloat(res.data.distance);

    // ✅ SAVE IN CACHE
    distanceCache[key] = distance;

    return distance;

  } catch (err) {
    console.error("Distance error:", err);

    // ✅ SAFE FALLBACK
    return 5;
  }
};
// import axios from "axios";

// const seen = new Set(); // Track duplicates globally or pass from caller

// export const calculateDistance = async (start, end) => {
//   const key = `${start.lat},${start.lng}-${end.lat},${end.lng}`;
//   if (seen.has(key)) return null; // skip duplicates
//   seen.add(key);

//   console.log("Start coords:", start);
//   console.log("End coords:", end);

//   try {
//     const res = await axios.get("http://localhost:3000/api/distance", {
//       params: {
//         startLat: start.lat,
//         startLng: start.lng,
//         endLat: end.lat,
//         endLng: end.lng,
//       },
//     });

//     return res.data.distance;

//   } catch (err) {
//     console.error("Distance error:", err);
//     return 0;
//   }
// };
// import axios from "axios";

// const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijc2YjQ3NGU3Nzc4ZjRkYWQ5M2MyYzg3NDAwMjJhOWFiIiwiaCI6Im11cm11cjY0In0=";

// export const calculateDistance = async (start, end) => {
//   const res = await axios.post(
//     "https://api.openrouteservice.org/v2/directions/driving-car",
//     {
//       coordinates: [
//         [start.lng, start.lat],
//         [end.lng, end.lat],
//       ],
//     },
//     {
//       headers: {
//         Authorization: ORS_API_KEY,
//         "Content-Type": "application/json",
//       },
//     }
//   );

//   return res.data.routes[0].summary.distance / 1000;
// };
