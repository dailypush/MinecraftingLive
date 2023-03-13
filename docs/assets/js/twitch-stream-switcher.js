$(document).ready(function () {
    const clientID = 'q6750mt57tam2vu6s9gze2bm0jxlle';
    const streamers = ['waldo0240', 'streamer2', 'streamer3'];
    const streamsEndpoint = 'https://api.twitch.tv/helix/streams';

    function checkChannels() {
        const queryString = `?user_login=${streamers.join('&user_login=')}`;

        fetch(`${streamsEndpoint}${queryString}`, {
            headers: {
                'Client-ID': clientID
            }
        })
            .then(response => response.json())
            .then(data => {
                const liveStreamers = data.data.map(stream => stream.user_name.toLowerCase());

                // Switch to the first live streamer, or default to Minecraft channel if none are live
                let channelName = '';
                if (liveStreamers.length > 0) {
                    channelName = liveStreamers[0];
                } else {
                    channelName = 'minecraft';
                }

                // Update the channel in the embed code
                embed.setChannel(channelName);
            })
            .catch(error => {
                console.error(error);
                embed.setChannel('minecraft'); // Default to Minecraft channel if there is an error
            });
    }

    // Check the channels every 5 minutes
    setInterval(checkChannels, 5 * 60 * 1000);

    // Initialize the Twitch embed
    var embed = new Twitch.Embed("twitch-embed", {
        width: 854,
        height: 480,
        channel: "minecraft",
        layout: "video",
        autoplay: false,
        // Only needed if this page is going to be embedded on other websites
        parent: ["minecrafting.live"]
    });

    embed.addEventListener(Twitch.Embed.VIDEO_READY, () => {
        var player = embed.getPlayer();
        player.play();
    });
  });
