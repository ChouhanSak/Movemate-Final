export async function searchAddress(query) {
  if (!query || query.length < 3) return [];

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}&addressdetails=1&limit=5`;

  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      // required by Nominatim usage policy
      "User-Agent": "MoveMateApp/1.0"
    }
  });

  const data = await res.json();

  return data.map(item => ({
    label: item.display_name,
    lat: item.lat,
    lon: item.lon,
    address: item.address
  }));
}