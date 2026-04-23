process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const delay = (ms) => new Promise(res => setTimeout(res, ms));

// ✅ ADD CACHE
const cache = {};
const distanceCache = {};

app.get("/api/geocode", async (req, res) => {
  const place = req.query.q;

  try {
    // ✅ 1. Check cache
    if (cache[place]) {
      console.log("From cache:", place);
      return res.json(cache[place]);
    }

    await delay(1000); // rate limit

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: place,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "movemate-app",
        },
      }
    );

    // ✅ 2. Save in cache
    cache[place] = response.data;

    res.json(response.data);

  } catch (err) {
    console.error("ERROR:", err.message);
    res.status(500).json({ error: "Geocoding failed" });
  }
});
app.get("/api/distance", async (req, res) => {
  const { startLat, startLng, endLat, endLng } = req.query;

  const key = `${startLat},${startLng}-${endLat},${endLng}`;

  try {
    if (distanceCache[key]) {
      return res.json({ distance: distanceCache[key] });
    }

    // ✅ SAME LOCATION FIX
    if (startLat == endLat && startLng == endLng) {
      return res.json({ distance: 0 });
    }

    const response = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        coordinates: [
          [parseFloat(startLng), parseFloat(startLat)],
          [parseFloat(endLng), parseFloat(endLat)],
        ],
      },
      {
        headers: {
          Authorization: "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijc2YjQ3NGU3Nzc4ZjRkYWQ5M2MyYzg3NDAwMjJhOWFiIiwiaCI6Im11cm11cjY0In0=",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const distance =
      response.data.routes[0].summary.distance / 1000;

    distanceCache[key] = distance;

    res.json({ distance });

  } catch (err) {
    console.error("FULL ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Distance failed" });
  }
});
app.listen(5000, () => {
  console.log("Backend running on http://localhost:3000");
});