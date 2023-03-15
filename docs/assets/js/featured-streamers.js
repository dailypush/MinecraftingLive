const featuredStreamersUsernames = ["Waldo0120", "Rainbowpaint", "SullivarN"]; // Replace with your desired streamers' usernames

async function fetchFeaturedStreamers() {
    try {
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const streamers = [];

        for (const username of featuredStreamersUsernames) {
            const response = await fetch(`/api/twitchApiHandler?action=getStreamerByUsername&username=${username}`);
            const streamer = await response.json();
            streamers.push(streamer);
            await delay(200); // Add a delay of 200ms between requests
        }

        displayFeaturedStreamers(streamers);
    } catch (error) {
        console.error(`Error fetching featured streamers: ${error.message}`);
    }
    document.getElementById("spinner").style.display = "none";
}



function displayFeaturedStreamers(streamers) {
    const featuredStreamersContainer = document.getElementById("featured-streamers");

    streamers.forEach((streamer) => {
        const col = document.createElement("div");
        col.className = "col-md-4 d-flex align-items-stretch mb-3";
        featuredStreamersContainer.appendChild(col);

        const card = document.createElement("div");
        card.className = "card d-flex flex-column align-items-center text-center";
        col.appendChild(card);

        const img = document.createElement("img");
        img.src = streamer.profile_image_url;
        img.className = "card-img-top rounded-circle mt-3";
        img.style.width = "100px";
        img.style.height = "100px";
        img.alt = `${streamer.display_name}'s profile picture`;
        card.appendChild(img);

        const cardBody = document.createElement("div");
        cardBody.className = "card-body d-flex flex-column";
        card.appendChild(cardBody);

        if (streamer.isLive) {
            const liveBadge = document.createElement("span");
            liveBadge.className = "live-badge";
            liveBadge.textContent = "LIVE";
            card.appendChild(liveBadge);
        }

        const name = document.createElement("h5");
        name.className = "card-title";
        name.textContent = streamer.display_name;
        cardBody.appendChild(name);

        const description = document.createElement("p");
        description.className = "card-text";
        description.textContent = streamer.description;
        cardBody.appendChild(description);

        const followButton = document.createElement("a");
        followButton.href = `https://www.twitch.tv/${streamer.login}?sr=a`;
        followButton.target = "_blank";
        followButton.rel = "noopener noreferrer";
        followButton.className = "btn btn-primary mt-auto";
        followButton.textContent = "Follow on Twitch";
        cardBody.appendChild(followButton);

    });
}
document.getElementById("spinner").style.display = "block";

fetchFeaturedStreamers();
