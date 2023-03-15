const featuredStreamersUsernames = ["Waldo0120", "Streamer2", "Streamer3"]; // Replace with your desired streamers' usernames

async function fetchFeaturedStreamers() {
    const streamers = await Promise.all(featuredStreamersUsernames.map(async (username) => {
        const response = await fetch(`/api/getStreamerByUsername?username=${username}`);
        const streamer = await response.json();
        return streamer;
    }));
    displayFeaturedStreamers(streamers);
}

function displayFeaturedStreamers(streamers) {
    const featuredStreamersContainer = document.getElementById("featuredStreamers");

    streamers.forEach(streamer => {
        const col = document.createElement("div");
        col.className = "col";

        const card = document.createElement("div");
        card.className = "card h-100";

        const cardBody = document.createElement("div");
        cardBody.className = "card-body";

        const cardTitle = document.createElement("h5");
        cardTitle.className = "card-title";
        cardTitle.textContent = streamer.display_name;

        // Add profile image
        const profileImage = document.createElement("img");
        profileImage.src = streamer.profile_image_url;
        profileImage.className = "rounded-circle mb-3";
        profileImage.style.width = "64px";
        profileImage.style.height = "64px";

        // Add Twitch description
        const description = document.createElement("p");
        description.className = "card-text";
        description.textContent = streamer.description;

        // Add custom follow button
        const followButton = document.createElement("a");
        followButton.href = `https://www.twitch.tv/${streamer.login}`;
        followButton.target = "_blank";
        followButton.className = "btn btn-primary mt-3";
        followButton.textContent = `Follow ${streamer.display_name}`;

        cardBody.appendChild(profileImage);
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(description);
        cardBody.appendChild(followButton); // Append custom follow button to cardBody
        card.appendChild(cardBody);
        col.appendChild(card);
        featuredStreamersContainer.appendChild(col);
    });
}


async function fetchMinecraftStreamers() {
    const response = await fetch("/api/getMinecraftStreamers");
    const streamers = await response.json();
    displayStreamers(streamers);
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
fetchFeaturedStreamers();
