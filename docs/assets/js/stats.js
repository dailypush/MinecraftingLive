
const apiCache = new Map();

async function fetchJsonCached(apiUrl) {
  if (apiCache.has(apiUrl)) {
    return apiCache.get(apiUrl);
  }

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Error fetching data from API: ${response.statusText}`);
    }
    const data = await response.json();
    apiCache.set(apiUrl, data);
    return data;
  } catch (error) {
    console.error(`Error fetching data from API: ${error.message}`);
    return null;
  }
}


async function getAggregatedStats(apiUrl, valueTransformFn = v => v) {
  const data = await fetchJsonCached(apiUrl);
  if (!data || !data.aggregatedStats) {
    console.error("Error: aggregatedStats not found in data");
    return [];
  }
  return Object.entries(data.aggregatedStats).map(([player, stats]) => {
    return { player, value: valueTransformFn(stats) };
  });
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


async function drawBarChart(chartId, apiUrl, valueExtractor = d => d.value) {
  const chartData = await getAggregatedStats(apiUrl);

  const margin = { top: 30, right: 30, bottom: 70, left: 100 };
  // const width = parseInt(d3.select(`#${chartId}`).style("width")) - margin.left - margin.right;
  // const height = parseInt(d3.select(`#${chartId}`).style("height")) - margin.top - margin.bottom;
  const width = 500 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  const x = d3.scaleLinear()
    .range([0, width])
    .domain([0, d3.max(chartData, d => d.value)]);

  const y = d3.scaleBand()
    .range([height, 0])
    .domain(chartData.map(d => d.player))
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
    .attr("y", d => y(d.player))
    .attr("height", y.bandwidth())
    .attr("x", 0)
    .attr("width", d => x(valueExtractor(d)))
    .attr("fill", "#4e73df");
}


function createSvg(chartId, margin, width, height) {
  return d3.select(`#${chartId}`)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
}
function createPieSvg(chartId, margin, width, height) {
  return d3.select(`#${chartId}`)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);
}


async function drawPieChart(chartId, apiUrl, valueTransformFn) {
  const chartData = await getAggregatedStats(apiUrl, valueTransformFn);

  const margin = { top: 30, right: 30, bottom: 30, left: 30 };
  const width = parseInt(d3.select(`#${chartId}`).style("width")) - margin.left - margin.right;
  const height = parseInt(d3.select(`#${chartId}`).style("height")) - margin.top - margin.bottom;
  const radius = Math.min(width, height) / 2;

  const svg = createPieSvg(chartId, margin, width, height);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const pie = d3.pie()
    .sort(null)
    .value(d => d.value);

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  // Create a labelArc with a larger radius than the arc
  const labelArc = d3.arc()
    .innerRadius(radius + 10)
    .outerRadius(radius + 10);

  const g = svg.selectAll(".arc")
    .data(pie(chartData))
    .enter().append("g")
    .attr("class", "arc");

  g.append("path")
    .attr("d", arc)
    .style("fill", d => color(d.data.player));

  g.append("text")
    .attr("transform", d => `translate(${labelArc.centroid(d)})`) // Use the labelArc to position the labels
    .attr("dy", ".35em")
    .text(d => d.data.player)
    .style("font-size", "10px")
    .style("text-anchor", "middle");
}


async function drawStackedBarChart(chartId, apiUrl) {
  const chartData = await getIndividualStats(apiUrl);
  const players = chartData.map(d => d.player);
  const travelTypes = ['walk_one_cm', 'swim_one_cm', 'fly_one_cm'];

  // Convert distances from centimeters to meters
  chartData.forEach(d => {
    d.walk_one_cm /= 100;
    d.swim_one_cm /= 100;
    d.fly_one_cm /= 100;
  });

  const margin = { top: 30, right: 30, bottom: 70, left: 100 };
  const width = 500 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;
  // const width = parseInt(d3.select(`#${chartId}`).style("width")) - margin.left - margin.right;
  // const height = parseInt(d3.select(`#${chartId}`).style("height")) - margin.top - margin.bottom;
  


  const x = d3.scaleBand()
    .domain(players)
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(chartData, d => d.walk_one_cm + d.swim_one_cm + d.fly_one_cm)]).nice()
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
    .attr("x", d => x(d.data.player))
    .attr("y", d => y(d[1]))
    .attr("height", d => Math.max(0, y(d[0]) - y(d[1])))
    .attr("width", x.bandwidth());
}


// drawBarChart("chart1", "https://stats.minecrafting.live/playerstats?category=minecraft:crafted&top=10&sort=desc", 'statValue');
//   drawBarChart("chart2", "https://stats.minecrafting.live/summarizedstats?statType=animals_bred");
//   drawPieChart("chart3", "https://stats.minecrafting.live/summarizedstats?statType=play_time", stats => stats.play_time / 3600); // Convert seconds to hours
//   drawStackedBarChart("chart4", "https://stats.minecrafting.live/summarizedstats?statType=one_cm"); // Convert centimeters to meters

function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

const debouncedDrawAllCharts = debounce(() => {
  // Remove the old SVGs before redrawing
  d3.selectAll("svg").remove();
  drawAllCharts();
}, 250); // The debounce delay in milliseconds, adjust as needed

window.addEventListener("resize", debouncedDrawAllCharts);
drawAllCharts();

function drawAllCharts() {
  drawBarChart("chart1", "https://stats.minecrafting.live/playerstats?category=minecraft:crafted&top=10&sort=desc", d => d.statValue);
  drawBarChart("chart2", "https://stats.minecrafting.live/summarizedstats?statType=animals_bred");
  drawPieChart("chart3", "https://stats.minecrafting.live/summarizedstats?statType=play_time", stats => stats.play_time / 3600); // Convert seconds to hours
  drawStackedBarChart("chart4", "https://stats.minecrafting.live/summarizedstats?statType=one_cm"); // Convert centimeters to meters
}

drawAllCharts();
