const axios = require("axios");

const clientId = process.env["TWITCH_CLIENT_ID"];
const clientSecret = process.env["TWITCH_CLIENT_SECRET"];

module.exports = async function (context, req) {
    const username = req.query.username;

    if (!username) {
        context.res = {
            status: 400,
            body: "Please provide a username in the query parameters.",
        };
        return;
    }

    try {
        const accessToken = await getAccessToken(clientId, clientSecret);
        const streamer = await getStreamerByUsername(username, accessToken);

        context.res = {
            status: 200,
            body: streamer,
        };
    } catch (error) {
        context.res = {
            status: 500,
            body: "Error fetching streamer data.",
        };
    }
};

async function getAccessToken(clientId, clientSecret) {
    const response = await axios.post("https://id.twitch.tv/oauth2/token", null, {
        params: {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "client_credentials",
        },
    });

    return response.data.access_token;
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
