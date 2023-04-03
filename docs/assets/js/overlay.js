d3.json("assets/data.json").then((players) => {
    // Populate the dropdown menu with player names
    const playerSelect = d3.select("#player-select");
    playerSelect.selectAll("option")
        .data(players)
        .enter()
        .append("option")
        .attr("value", d => d.player)
        .text(d => d.player);

    // Set up the containers and dimensions
    const containerSize = { width: 400, height: 300 };

    const killsDeathsContainer = d3.select("#kills-deaths-graph");
    const blocksMinedContainer = d3.select("#blocks-mined-graph");
    const mobKillsContainer = d3.select("#mob-kills-graph");
    const customBlocksMinedContainer = d3.select("#custom-blocks-mined-graph");

    // Create the SVG elements
    const killsDeathsSvg = createSvg(killsDeathsContainer, containerSize);
    const blocksMinedSvg = createSvg(blocksMinedContainer, containerSize);
    const mobKillsSvg = createSvg(mobKillsContainer, containerSize);
    const customBlocksMinedSvg = createSvg(customBlocksMinedContainer, containerSize);

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
        const playerData = players.filter(d => d.player === player)[0];

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

    function createBarGraph(svg, size, categories, labels, values, colors = null, duration = 1000) {
        const yScale = d3.scaleBand()
            .domain(categories)
            .range([0, size.height])
            .padding(0.1);
    
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(values)])
            .range([0, size.width]);
    
        const bars = svg.selectAll(".bar")
            .data(values);
    
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("y", (_, i) => yScale(categories[i]))
            .attr("x", 0)
            .attr("height", yScale.bandwidth())
            .attr("fill", (_, i) => colors ? colors[labels[i]] : "steelblue")
            .attr("width", 0)
            .transition()
            .duration(duration)
            .attr("width", d => xScale(d));
    
        svg.selectAll(".bar-value")
            .data(values)
            .enter()
            .append("text")
            .attr("class", "bar-value")
            .attr("y", (_, i) => yScale(categories[i]) + yScale.bandwidth() / 2)
            .attr("x", 5)
            .attr("dy", ".35em")
            .text(d => d)
            .transition()
            .duration(duration)
            .attr("x", d => xScale(d) + 5);
    
        // Add the y-axis
        svg.append("g")
            .call(d3.axisLeft(yScale).tickFormat((_, i) => labels[i]));
    
        // Add the x-axis
        svg.append("g")
            .attr("transform", `translate(0, ${size.height})`)
            .call(d3.axisBottom(xScale));
    }
    


    // Update the graph when the player selection changes
    playerSelect.on("change", function () {
        const player = d3.select(this).property("value");
        updateGraph(player);
    });

    // variable to store the selected block types
    const customBlocksMined = [];

    function updateCustomBlocksMinedGraph(playerData) {
        const labels = customBlocksMined.map(block => block);
        const values = customBlocksMined.map(block => playerData.blocksMined[block]);

        customBlocksMinedSvg.selectAll('*').remove();
        createBarGraph(
            customBlocksMinedSvg,
            containerSize,
            customBlocksMined,
            labels,
            values,
            blockColors
        );
    }

    // event listener to update the custom chart when the user adds a new block
    document.getElementById('custom-blocks-mined-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const blockSelect = document.getElementById('block-select');
        const block = blockSelect.value;

        if (block && !customBlocksMined.includes(block)) {
            customBlocksMined.push(block);
            const selectedPlayer = playerSelect.property('value');
            if (selectedPlayer) {
                updateCustomBlocksMinedGraph(players[selectedPlayer]);
            }
        }
        blockSelect.value = '';
    });

});
