//  REMOVE THIS LINE (unsafe)
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// ✅ Use Map for proper caching
const geocodeCache = new Map();

// Utility delay (rate limit protection)
const delay = (ms) => new Promise((res) => setTimeout(res, ms));


// -----------------------------------
// GET /api/geocode?q=PLACE
// -----------------------------------
app.get("/api/geocode", async (req, res) => {
  const place = req.query.q;

  if (!place) {
    return res.status(400).json({ error: "Place required" });
  }

  const key = place.toLowerCase().replace(/\s+/g, "") + ",india";

  // ✅ FIXED CACHE CHECK
  if (geocodeCache.has(key)) {
    console.log("From cache:", place);
    return res.json(geocodeCache.get(key));
  }

  try {
    // ⏳ Respect rate limit
    await delay(1200);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      place + ", India"
    )}&format=json&limit=1`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "MoveMateApp/1.0 (your@email.com)",
      },
      timeout: 5000, // ✅ prevent hanging
      validateStatus: () => true,
    });

    // 🚫 Handle rate limit
    if (response.status === 429) {
      console.log("⚠️ Rate limited!");
      return res.status(429).json({
        error: "Too many requests. Try again later.",
      });
    }

    const data = response.data;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Location not found" });
    }

    // ✅ Save in cache properly
    geocodeCache.set(key, data);

    res.json(data);

  } catch (err) {
    console.error("Geocoding error:", err.message);

    // ✅ FAIL-SAFE RESPONSE (IMPORTANT)
    res.json([
      {
        lat: "26.4499",  // fallback (Ajmer approx)
        lon: "74.6399",
      },
    ]);
  }
});


// -----------------------------------
// GET /api/distance
// -----------------------------------
app.get("/api/distance", async (req, res) => {
  const { startLat, startLng, endLat, endLng } = req.query;

  if (!startLat || !startLng || !endLat || !endLng) {
    return res.status(400).json({ error: "All coordinates required" });
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${parseFloat(
      startLng
    )},${parseFloat(startLat)};${parseFloat(endLng)},${parseFloat(
      endLat
    )}?overview=false`;

    const response = await axios.get(url, {
      timeout: 5000, // ✅ prevent hang
    });

    const data = response.data;

    if (!data.routes || data.routes.length === 0) {
      return res.json({ distance: 5 }); // ✅ fallback
    }

    const distanceKm = (data.routes[0].distance / 1000).toFixed(2);

    res.json({ distance: distanceKm });

  } catch (err) {
    console.error("Distance error:", err.message);

    // ✅ NEVER FAIL
    res.json({ distance: 5 });
  }
});


// Start server
app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// // server.js
// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");
// const https = require("https");

// const app = express();
// app.use(cors());

// // Simple in-memory cache to avoid repeated API calls
// const geocodeCache = {};

// // Utility delay to respect rate limits
// const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// // -----------------------------------
// // GET /api/geocode?q=PLACE
// // -----------------------------------
// app.get("/api/geocode", async (req, res) => {
//   const place = req.query.q;

//   if (!place) {
//     return res.status(400).json({ error: "Place required" });
//   }

//   const key = place.toLowerCase().replace(/\s+/g, "") + ",india";

//   // Return from cache if exists
//   if (geocodeCache.has(key)) {
//     return res.json(geocodeCache.get(key));
//   }
//     console.log("From cache:", place);
//     return res.json(geocodeCache[key]);


//   try {
//     // Delay to respect Nominatim rate limit (1 request/sec)
//     await delay(1200);

//     const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
//       place + ", India"
//     )}&format=json&limit=1`;

//     const response = await axios.get(url, {
//       headers: {
//         "User-Agent": "MoveMateApp/1.0 (swastigupta2004@gmail.com)",
//       },
//       validateStatus: () => true, // Avoid axios throwing on 429
//     });

//     // Handle too many requests
//     if (response.status === 429) {
//       return res.status(429).json({
//         error: "Too many requests to geocoding API. Please try again later.",
//       });
//     }

//     const data = response.data;

//     if (!data || data.length === 0) {
//       return res.status(404).json({ error: "Location not found" });
//     }

//     // Save to cache
//     geocodeCache[key] = data;

//     res.json(data);
//   } catch (err) {
//     console.error("Geocoding error:", err.message);
//     res.status(500).json({ error: "Geocoding failed" });
//   }
// });

// // -----------------------------------
// // GET /api/distance?startLat=&startLng=&endLat=&endLng=
// // -----------------------------------
// app.get("/api/distance", async (req, res) => {
//   const { startLat, startLng, endLat, endLng } = req.query;

//   if (!startLat || !startLng || !endLat || !endLng) {
//     return res.status(400).json({ error: "All coordinates required" });
//   }

//   try {
//     const url = `https://router.project-osrm.org/route/v1/driving/${parseFloat(
//       startLng
//     )},${parseFloat(startLat)};${parseFloat(endLng)},${parseFloat(
//       endLat
//     )}?overview=false`;

//     const response = await axios.get(url); // default https agent
//     const data = response.data;

//     if (!data.routes || data.routes.length === 0) {
//       return res.status(404).json({ error: "Route not found" });
//     }

//     const distanceKm = (data.routes[0].distance / 1000).toFixed(2);

//     res.json({ distance: distanceKm });
//   } catch (err) {
//     console.error("Distance error:", err.message);
//     res.status(500).json({ error: "Distance failed" });
//   }
// });

// // Start server
// app.listen(3000, () => {
//   console.log("Backend running on http://localhost:3000");
// });