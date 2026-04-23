import axios from "axios";

export const calculateDistance = async (start, end) => {
  try {
    const res = await axios.get("http://localhost:3000/api/distance", {
      params: {
        startLat: start.lat,
        startLng: start.lng,
        endLat: end.lat,
        endLng: end.lng,
      },
    });

    return res.data.distance;

  } catch (err) {
    console.error("Distance error:", err);
    return 0;
  }
 };