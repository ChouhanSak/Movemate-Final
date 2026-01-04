import axios from "axios";

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijc2YjQ3NGU3Nzc4ZjRkYWQ5M2MyYzg3NDAwMjJhOWFiIiwiaCI6Im11cm11cjY0In0=";

export const calculateDistance = async (start, end) => {
  const res = await axios.post(
    "https://api.openrouteservice.org/v2/directions/driving-car",
    {
      coordinates: [
        [start.lng, start.lat],
        [end.lng, end.lat],
      ],
    },
    {
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.routes[0].summary.distance / 1000;
};
