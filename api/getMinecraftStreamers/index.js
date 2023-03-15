const axios = require("axios");

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

module.exports = async function (context, req) {
  const accessToken = await getTwitchAccessToken(clientId, clientSecret);
  const minecraftStreamers = await getActiveMinecraftStreamers(accessToken);
  context.res = {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(minecraftStreamers),
  };
};

async function getTwitchAccessToken(clientId, clientSecret) {
  const response = await axios.post(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
  );
  return response.data.access_token;
}

async function getActiveMinecraftStreamers(accessToken) {
  const headers = {
    "Client-ID": clientId,
    "Authorization": `Bearer ${accessToken}`,
  };
  const response = await axios.get("https://api.twitch.tv/helix/streams?game_id=27471&first=10", {
    headers,
  });
  return response.data.data;
}
