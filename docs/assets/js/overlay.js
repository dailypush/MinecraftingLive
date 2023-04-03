d3.json("assets/data.json").then((data) => {
    // Populate the dropdown menu with player names
    const playerSelect = d3.select("#player-select");
    playerSelect.selectAll("option")
        .data(data)
        .enter()
        .append("option")
        .attr("value", d => d.player)
        .text(d => d.player);

    // Set up the containers and dimensions
    const containerSize = { width: 400, height: 300 };

    const killsDeathsContainer = d3.select("#kills-deaths-graph");
    const blocksMinedContainer = d3.select("#blocks-mined-graph");
    const mobKillsContainer = d3.select("#mob-kills-graph");

    // Create the SVG elements
    const killsDeathsSvg = createSvg(killsDeathsContainer, containerSize);
    const blocksMinedSvg = createSvg(blocksMinedContainer, containerSize);
    const mobKillsSvg = createSvg(mobKillsContainer, containerSize);

    const blockColors = {
        "stone": "#A9A9A9",
        "dirt": "#8B4513",
        "wood": "#A0522D",
        "sand": "#F4A460",
        "gravel": "#808080"
    };


    // Helper function to create SVG elements
    function createSvg(container, size) {
        return container.append("svg")
            .attr("width", size.width)
            .attr("height", size.height);
    }

    // Function to update the graphs
    function updateGraph(player) {
        // Clear the SVGs
        killsDeathsSvg.selectAll("*").remove();
        blocksMinedSvg.selectAll("*").remove();
        mobKillsSvg.selectAll("*").remove();

        // If no player is selected, don't display anything
        if (!player) return;

        // Filter data for the selected player
        const playerData = data.filter(d => d.player === player)[0];

        // Update kills/deaths graph
        createBarGraph(
            killsDeathsSvg,
            containerSize,
            ["kills", "deaths"],
            ["Kills", "Deaths"],
            [playerData.kills, playerData.deaths]
        );

        // Update blocks mined graph
        createBarGraph(
            blocksMinedSvg,
            containerSize,
            Object.keys(playerData.blocksMined),
            Object.keys(playerData.blocksMined),
            Object.values(playerData.blocksMined),
            blockColors
        );


        // Update mob kills graph
        createBarGraph(
            mobKillsSvg,
            containerSize,
            Object.keys(playerData.mobKills),
            Object.keys(playerData.mobKills),
            Object.values(playerData.mobKills)
        );
    }
    // Function to create a bar graph
    function createBarGraph(svg, size, categories, labels, values, colors = null) {
        const xScale = d3.scaleBand()
            .domain(categories)
            .range([0, size.width])
            .padding(0.1);
    
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(values)])
            .range([size.height, 0]);
    
        svg.selectAll(".bar")
            .data(values)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (_, i) => xScale(categories[i]))
            .attr("y", d => yScale(d))
            .attr("width", xScale.bandwidth())
            .attr("height", d => size.height - yScale(d))
            .attr("fill", (_, i) => colors ? colors[labels[i]] : "steelblue");
    
        svg.selectAll(".bar-value")
            .data(values)
            .enter()
            .append("text")
            .attr("class", "bar-value")
            .attr("x", (_, i) => xScale(categories[i]) + xScale.bandwidth() / 2)
            .attr("y", d => yScale(d) - 5)
            .attr("text-anchor", "middle")
            .text(d => d);
    
        // Add the x-axis
        svg.append("g")
            .attr("transform", `translate(0, ${size.height})`)
            .call(d3.axisBottom(xScale).tickFormat((_, i) => labels[i]));
    
        // Add the y-axis
        svg.append("g")
            .call(d3.axisLeft(yScale));
    }
    

    // Update the graph when the player selection changes
    playerSelect.on("change", function () {
        const player = d3.select(this).property("value");
        updateGraph(player);
    });
});

