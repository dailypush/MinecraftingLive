async function fetchMinecraftStreamers() {
    try {
        const response = await fetch("/api/getMinecraftStreamers");
        // const response = await fetch("/api/twitchApiHandler?action=getMinecraftStreamers");
        const streamers = await response.json();
        displayStreamers(streamers);
    } catch (error) {
        console.error(`Error fetching Minecraft streamers: ${error.message}`);
    }
}
function displayStreamers(streamers) {
    const streamersContainer = document.getElementById("streamers");

    streamers.forEach(streamer => {
        const col = document.createElement("div");
        col.className = "col";

        const card = document.createElement("div");
        card.className = "card h-100";

        const iframe = document.createElement("iframe");
        iframe.src = `https://player.twitch.tv/?channel=${streamer.user_name}&parent=${location.hostname}&autoplay=false`;
        iframe.allowFullscreen = true;
        iframe.className = "embed-responsive-item";

        const cardBody = document.createElement("div");
        cardBody.className = "card-body";

        const cardTitle = document.createElement("h5");
        cardTitle.className = "card-title";
        cardTitle.textContent = streamer.user_name;

        // Add profile image
        const profileImage = document.createElement("img");
        profileImage.src = streamer.profile_image_url;
        profileImage.className = "rounded-circle mb-3";
        profileImage.style.width = "64px";
        profileImage.style.height = "64px";

        cardBody.appendChild(profileImage);
        cardBody.appendChild(cardTitle);
        card.appendChild(iframe);
        card.appendChild(cardBody);
        col.appendChild(card);
        streamersContainer.appendChild(col);
    });
}

fetchMinecraftStreamers();