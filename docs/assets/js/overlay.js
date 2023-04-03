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
    const containerSize = { width: 500, height: 300 };


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
        const playerData = data.filter(d => d.player === player)[0];
    
        // Update kills/deaths graph
        createDonutChart(
            killsDeathsSvg,
            containerSize,
            { kills: playerData.kills, deaths: playerData.deaths }
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
    
    function createDonutChart(svg, size, ratio) {
        const radius = Math.min(size.width, size.height) / 2;
        const arc = d3.arc()
            .innerRadius(radius - 50)
            .outerRadius(radius);
    
        const pie = d3.pie()
            .value(d => d.value);
    
        const killsDeathsData = [
            { label: "Kills", value: ratio.kills },
            { label: "Deaths", value: ratio.deaths }
        ];
    
        const colorScale = d3.scaleOrdinal()
            .domain(killsDeathsData.map(d => d.label))
            .range(["#1f77b4", "#d62728"]);
    
        const g = svg.append("g")
            .attr("transform", `translate(${size.width / 2}, ${size.height / 2})`);
    
        const arcs = g.selectAll(".arc")
            .data(pie(killsDeathsData))
            .enter()
            .append("g")
            .attr("class", "arc");
    
        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => colorScale(d.data.label));
    
        arcs.append("text")
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .attr("dy", ".35em")
            .text(d => d.data.label)
            .attr("fill", "#fff");
    }
    


    function createBarGraph(svg, size, categories, labels, values, colors = null, duration = 1000) {
        const yScale = d3.scaleBand()
            .domain(categories)
            .range([0, size.height])
            .padding(0.1);
    
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(values)])
            .range([0, size.width - 50]); // leave 50px padding on the right
    
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
    
        // Add x-axis labels
        svg.selectAll(".x-axis-label")
            .data(labels)
            .enter()
            .append("text")
            .attr("class", "x-axis-label")
            .attr("x", (_, i) => xScale(values[i]) + 5)
            .attr("y", (_, i) => yScale(categories[i]) + yScale.bandwidth() / 2 + 5)
            .text((d, i) => `${d}: ${values[i]}`);
    
        // Add the y-axis
        svg.append("g")
            .call(d3.axisLeft(yScale));
    
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
                const playerData = data.filter(d => d.player === selectedPlayer)[0];
                updateCustomBlocksMinedGraph(playerData);
            }
        }
        blockSelect.value = '';
    });
    

});
