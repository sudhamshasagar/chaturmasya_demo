const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const youtubeApiKey = defineSecret("YOUTUBE_API_KEY");

const CHANNEL_ID = "UCrr8qeWVgaExzBEDHLTEDVw";

exports.getLiveVideo = onRequest(
  {
    secrets: [youtubeApiKey],
    cors: true,
  },
  async (req, res) => {
    try {
      const url =
        `https://www.googleapis.com/youtube/v3/search` +
        `?part=snippet` +
        `&channelId=${CHANNEL_ID}` +
        `&eventType=live` +
        `&type=video` +
        `&key=${youtubeApiKey.value()}`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("YouTube API Error:", errorText);

        return res.status(500).json({
          success: false,
          error: "Failed to fetch live stream.",
        });
      }

      const data = await response.json();

      if (data.items && data.items.length > 0) {
        return res.status(200).json({
          success: true,
          live: true,
          videoId: data.items[0].id.videoId,
          title: data.items[0].snippet.title,
        });
      }

      return res.status(200).json({
        success: true,
        live: false,
      });
    } catch (error) {
      console.error("getLiveVideo Error:", error);

      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);