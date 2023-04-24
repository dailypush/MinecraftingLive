fetch("https://stats.minecrafting.live/playerstats?category=minecraft:crafted&top=10&sort=desc")
  .then(response => response.json())
  .then(data => {
    const chartData = data.map(item => ({
      name: item.stat_type.split(":").pop().replace(/_/g, " "),
      value: item.value
    }));

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#chart1")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleBand()
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .range([height, 0]);

    x.domain(chartData.map(d => d.name));
    y.domain([0, d3.max(chartData, d => d.value)]);

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));

    svg.selectAll(".bar")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.name))
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.value))
      .attr("height", d => height - y(d.value));
  });
  async function drawChart(chartId) {
    const apiUrl = "https://stats.minecrafting.live/summarizedstats?statType=animals_bred";
    const response = await fetch(apiUrl);
    const data = await response.json();
    const aggregatedStats = Object.entries(data.aggregatedStats);
  
    const margin = { top: 30, right: 30, bottom: 70, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
  
    const x = d3.scaleBand()
      .range([0, width])
      .domain(aggregatedStats.map(d => d[0]))
      .padding(0.2);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(aggregatedStats, d => d[1].animals_bred)])
      .range([height, 0]);
  
    const svg = d3.select(`#${chartId}`)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
  
    svg.append("g")
      .call(d3.axisLeft(y));
  
    svg.selectAll("rect")
      .data(aggregatedStats)
      .enter()
      .append("rect")
        .attr("x", d => x(d[0]))
        .attr("y", d => y(d[1].animals_bred))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[1].animals_bred))
        .attr("fill", "#4e73df");
  }
  
  drawChart("chart2"); // Call the function for the specific chart
  