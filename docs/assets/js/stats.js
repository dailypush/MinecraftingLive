
const apiCache = new Map();

async function fetchJsonCached(apiUrl) {
  if (apiCache.has(apiUrl)) {
    return apiCache.get(apiUrl);
  }

  const response = await fetch(apiUrl);
  const data = await response.json();
  apiCache.set(apiUrl, data);
  return data;
}

async function getAggregatedStats(apiUrl, convertToMeters = false) {
  const data = await fetchJsonCached(apiUrl);
  let result = Object.entries(data.aggregatedStats);

  if (convertToMeters) {
    result = result.map(([name, value]) => [name, value / 100]);
  }

  return result;
}

async function getIndividualStats(apiUrl) {
  const data = await fetchJsonCached(apiUrl);
  const individualStats = data.individualStats;
  const players = Object.keys(individualStats);
  const processedData = players.map(player => {
    const stats = individualStats[player];
    return {
      player,
      walk_one_cm: stats['player_stats:' + player + ':minecraft:custom:minecraft:walk_one_cm'] || 0,
      swim_one_cm: stats['player_stats:' + player + ':minecraft:custom:minecraft:swim_one_cm'] || 0,
      fly_one_cm: stats['player_stats:' + player + ':minecraft:custom:minecraft:fly_one_cm'] || 0,
    };
  });
  return processedData;
}


function createSvg(chartId, margin, width, height) {
  return d3.select(`#${chartId}`)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
}


  async function drawHistogram(chartId, apiUrl) {
  const aggregatedStats = await getAggregatedStats(apiUrl);
  const playTimes = aggregatedStats.map(d => d[1].play_time);
  
    const margin = { top: 30, right: 30, bottom: 70, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
  
    const x = d3.scaleLinear()
      .domain([0, d3.max(aggregatedStats)])
      .range([0, width]);
  
    const histogram = d3.histogram()
      .value(d => d)
      .domain(x.domain())
      .thresholds(x.ticks(30));
  
    const bins = histogram(aggregatedStats);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([height, 0]);
  
    const svg = d3.select(`#${chartId}`)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
  
    svg.append("g")
      .call(d3.axisLeft(y));
  
    svg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
        .attr("x", d => x(d.x0))
        .attr("y", d => y(d.length))
        .attr("width", d => x(d.x1) - x(d.x0) - 1)
        .attr("height", d => height - y(d.length))
        .attr("fill", "#4e73df");
  }
  


  async function drawHorizontalBarChart(chartId, apiUrl) {
    const chartData = await getAggregatedStats(apiUrl, true);
  
    const margin = { top: 30, right: 30, bottom: 70, left: 100 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
  
    const x = d3.scaleLinear()
      .range([0, width])
      .domain([0, d3.max(chartData, d => d[1])]);
  
    const y = d3.scaleBand()
      .range([height, 0])
      .domain(chartData.map(d => d[0]))
      .padding(0.1);
  
    const svg = createSvg(chartId, margin, width, height);
  
    svg.append("g")
      .call(d3.axisLeft(y));
  
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
  
    svg.selectAll(".bar")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => y(d[0]))
      .attr("height", y.bandwidth())
      .attr("x", 0)
      .attr("width", d => x(d[1]))
      .attr("fill", "#4e73df");
  }
  
  async function drawStackedBarChart(chartId, apiUrl) {
    const chartData = await getIndividualStats(apiUrl);
    const players = chartData.map(d => d.player);
    const travelTypes = ['walk_one_cm', 'swim_one_cm', 'fly_one_cm'];
  
    const margin = { top: 30, right: 30, bottom: 70, left: 100 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
  
    const x = d3.scaleBand()
      .domain(players)
      .range([0, width])
      .padding(0.1);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d[1].walk_one_cm + d[1].swim_one_cm + d[1].fly_one_cm)]).nice()
      .range([height, 0]);
  
    const color = d3.scaleOrdinal()
      .domain(travelTypes)
      .range(['#4e73df', '#1cc88a', '#36b9cc']);
  
    const svg = createSvg(chartId, margin, width, height);
  
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
  
    svg.append("g")
      .call(d3.axisLeft(y));
  
    const layer = svg.selectAll(".layer")
      .data(d3.stack().keys(travelTypes)(chartData))
      .enter().append("g")
      .attr("class", "layer")
      .attr("fill", d => color(d.key));
  
    layer.selectAll("rect")
      .data(d => d)
      .enter().append("rect")
      .attr("x", d => x(d.data[0]))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth());
  }
  

// Call the functions for the specific charts
drawChart("chart1", "https://stats.minecrafting.live/playerstats?category=minecraft:crafted&top=10&sort=desc");
drawChart("chart2", "https://stats.minecrafting.live/summarizedstats?statType=animals_bred");
drawHistogram("chart3", "https://stats.minecrafting.live/summarizedstats?statType=play_time");
drawHorizontalBarChart("chart4", "https://stats.minecrafting.live/summarizedstats?statType=one_cm");

