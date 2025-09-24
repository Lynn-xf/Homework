const axios = require("axios");

async function getArtSuggestion(query) {
  const apiKey = process.env.HARVARD_API_KEY;
  if (!apiKey) throw new Error("HARVARD_API_KEY is not set");

  const encoded = encodeURIComponent(query);
  const url = "https://api.harvardartmuseums.org/object";
  const params = { apikey: apiKey, keyword: query, size: 1 };

  try {
    const response = await axios.get(url, { params });
    const records = response.data.records;
    if (records && records.length > 0) {
      const art = records[0];
      const title = art.title || "Untitled";
      const artist = art.people && art.people[0]?.name ? ` by ${art.people[0].name}` : "";
      const image = art.primaryimageurl || "";
      return `How about exploring the artwork "${title}"${artist}? Here's a preview: ${image}`;
    } else {
      return `No matching artwork found for "${query}".`;
    }
  } catch (err) {
    console.error("Harvard Art Museums API error:", err.message);
    return "Failed to fetch art suggestion.";
  }
}

module.exports = { getArtSuggestion };
