const axios = require("axios");

const clientId = process.env["TWITCH_CLIENT_ID"];
const clientSecret = process.env["TWITCH_CLIENT_SECRET"];

let accessTokenCache = {
    token: null,
    expiry: null,
};

module.exports = async function (context, req) {
    const action = req.query.action;
    const username = req.query.username;

    try {
        const accessToken = await getAccessToken(clientId, clientSecret);

        if (action === "getMinecraftStreamers") {
            const streamers = await getMinecraftStreamers(accessToken);
            context.res = {
                status: 200,
                body: streamers,
            };
        } else if (action === "getStreamerByUsername" && username) {
            const streamer = await getStreamerByUsername(username, accessToken);
            context.res = {
                status: 200,
                body: streamer,
            };
        } else {
            context.res = {
                status: 400,
                body: "Please provide a valid action and parameters.",
            };
        }
    } catch (error) {
        context.res = {
            status: 500,
            body: "Error fetching data from Twitch API.",
        };
    }
};

async function getAccessToken(clientId, clientSecret) {
    const currentTime = new Date().getTime();

    if (accessTokenCache.token && currentTime < accessTokenCache.expiry) {
        return accessTokenCache.token;
    }

    const response = await axios.post("https://id.twitch.tv/oauth2/token", null, {
        params: {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "client_credentials",
        },
    });

    const expiresIn = response.data.expires_in * 1000;
    accessTokenCache.token = response.data.access_token;
    accessTokenCache.expiry = currentTime + expiresIn - 60000; // Subtract 1 minute to account for potential delays

    return accessTokenCache.token;
}

async function getMinecraftStreamers(accessToken) {
    const headers = {
        "Client-ID": clientId,
        "Authorization": `Bearer ${accessToken}`,
    };

    const response = await axios.get("https://api.twitch.tv/helix/streams?game_id=27471&first=9", {
        headers,
    });

    return response.data.data;
}

async function getStreamerByUsername(username, accessToken) {
    const headers = {
        "Client-ID": clientId,
        "Authorization": `Bearer ${accessToken}`,
    };

    const response = await axios.get(`https://api.twitch.tv/helix/users?login=${username}`, {
        headers,
    });

    return response.data.data[0];
}
