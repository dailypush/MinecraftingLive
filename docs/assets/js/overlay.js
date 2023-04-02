d3.json("/assets/data.json").then((data) => {
    // Populate the dropdown menu with player names
    const playerSelect = d3.select("#player-select");
    playerSelect.selectAll("option")
        .data(data)
        .enter()
        .append("option")
        .attr("value", d => d.player)
        .text(d => d.player);

    // Set up the container and dimensions
    const container = d3.select("#stats-graph");
    const width = container.node().getBoundingClientRect().width;
    const height = container.node().getBoundingClientRect().height;

    // Create the SVG element
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    // Function to update the graph
    function updateGraph(player) {
        // Clear the SVG
        svg.selectAll("*").remove();

        // If no player is selected, don't display anything
        if (!player) return;

        // Filter data for the selected player
        const playerData = data.filter(d => d.player === player)[0].blocksMined;

        // Create a simple bar chart for player-specific block types mined
        const blockTypes = Object.keys(playerData);
        const xScale = d3.scaleBand()
            .domain(blockTypes)
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(blockTypes, blockType => playerData[blockType])])
            .range([height, 0]);

        svg.selectAll(".bar")
            .data(blockTypes)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", blockType => xScale(blockType))
            .attr("y", blockType => yScale(playerData[blockType]))
            .attr("width", xScale.bandwidth())
            .attr("height", blockType => height - yScale(playerData[blockType]))
            .attr("fill", "steelblue");

        // Add the x-axis
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));

        // Add the y-axis
        svg.append("g")
            .call(d3.axisLeft(yScale));
    }

    // Update the graph when the player selection changes
    playerSelect.on("change", function() {
        const player = d3.select(this).property("value");
        updateGraph(player);
    });
});
