
(async function () {
    await drawAllCharts();
})();


async function fetchChartData(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Error fetching data from API: ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.aggregatedStats) {
            throw new Error("Error: aggregatedStats not found in data");
        }
        return data.aggregatedStats;
    } catch (error) {
        console.error(`Error fetching data from API: ${error.message}`);
        return null;
    }
}


function prepareChartData2(rawData) {
    const labels = [];
    const data = [];

    for (const player in rawData) {
        labels.push(player);
        data.push(rawData[player].animals_bred);
    }

    return {
        labels,
        data,
    };
}


async function fetchData(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Error fetching data from API: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from API: ${error.message}`);
        return null;
    }
}

async function drawBarChart(chartId, apiUrl) {
    const data = await fetchData(apiUrl);
    const isArray = Array.isArray(data);
    const labels = isArray ? data.map(item => item.player) : Object.keys(data);
    const values = isArray ? data.map(item => item.value) : Object.values(data);
  
    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Value',
          data: values,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  

async function drawPieChart(chartId, apiUrl) {
    const data = await fetchData(apiUrl);
    const labels = data.map(item => item.player);
    const values = data.map(item => item.value);

    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        }
    });
}

async function drawStackedBarChart(chartId, apiUrl) {
    const data = await getIndividualStats(apiUrl);
    const labels = data.map(item => item.player);
    const walkData = data.map(item => item.walk_one_cm);
    const swimData = data.map(item => item.swim_one_cm);
    const flyData = data.map(item => item.fly_one_cm);

    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Walk',
                    data: walkData,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Swim',
                    data: swimData,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Fly',
                    data: flyData,
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true
                }
            }
        }
    });
}


async function drawAllCharts() {
    const chart1ApiUrl = 'https://stats.minecrafting.live/playerstats?category=minecraft:crafted&top=10&sort=desc';
    const chart2ApiUrl = 'https://stats.minecrafting.live/summarizedstats?statType=animals_bred';
    const chart3ApiUrl = 'https://stats.minecrafting.live/summarizedstats?statType=play_time';
    const chart4ApiUrl = 'https://stats.minecrafting.live/summarizedstats?statType=one_cm';

    await drawBarChart('chart1', chart1ApiUrl);

    const chart2Data = await fetchChartData(chart2ApiUrl);
    const { labels, data } = prepareChartData2(chart2Data);
    const chart2Context = document.getElementById('chart2').getContext('2d');
    const chart2Instance = new Chart(chart2Context, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Animals Bred',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });

    await drawPieChart('chart3', chart3ApiUrl);
    await drawStackedBarChart('chart4', chart4ApiUrl);
}
