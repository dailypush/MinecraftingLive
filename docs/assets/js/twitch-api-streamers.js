const featuredStreamersUsernames = ["Waldo0120", "Rainbowpaint", "Streamer3"]; // Replace with your desired streamers' usernames

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

        // const cardFooter = document.createElement("div");
        // cardFooter.className = "card-footer text-center";
        // cardFooter.textContent = `Followers: ${streamer.followers}`;
        // card.appendChild(cardFooter);
    });
}

// function displayFeaturedStreamers(streamers) {
//     const featuredStreamersContainer = document.getElementById("featured-streamers");

//     streamers.forEach((streamer) => {
//         const col = document.createElement("div");
//         col.className = "col-md-4";
//         featuredStreamersContainer.appendChild(col);

//         const card = document.createElement("div");
//         card.className = "card";
//         col.appendChild(card);

//         const cardHeader = document.createElement("h3");
//         cardHeader.className = "card-header text-center text-style";
//         cardHeader.style.cursor = "pointer";
//         card.appendChild(cardHeader);

//         const img = document.createElement("img");
//         img.src = streamer.profile_image_url;
//         img.style.maxWidth = "100%";
//         img.alt = `${streamer.display_name}'s profile picture`;
//         cardHeader.appendChild(img);
//         cardHeader.appendChild(document.createElement("br"));
//         cardHeader.appendChild(document.createTextNode(streamer.display_name));

//         const center = document.createElement("center");
//         card.appendChild(center);

//         const followButton = document.createElement("a");
//         followButton.href = `https://www.twitch.tv/${streamer.login}`;
//         followButton.target = "_blank";
//         center.appendChild(followButton);

//         const button = document.createElement("button");
//         button.className = "btn btn-primary btn-lg copyIp mb-3 text-uppercase font-weight-bold";
//         button.style.border = "0px";
//         button.style.borderBottom = "2px";
//         button.textContent = "Twitch";
//         followButton.appendChild(button);

//         const description = document.createElement("p");
//         description.textContent = streamer.description;
//         card.appendChild(description);
//     });
// }





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
fetchFeaturedStreamers();
