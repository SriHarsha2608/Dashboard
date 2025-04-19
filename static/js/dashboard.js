const tdsCtx = document.getElementById('tdsChart').getContext('2d');
const turbidityCtx = document.getElementById('turbidityChart').getContext('2d');
const phCtx = document.getElementById('phChart').getContext('2d');
const tempCtx = document.getElementById('temperatureChart').getContext('2d');

// Chart configurations
const chartConfig = {
    type: 'line',
    options: {
        responsive: true,
        scales: {
            x: { title: { display: true, text: 'Time' } },
            y: { beginAtZero: true }
        }
    }
};

// Initialize charts
const tdsChart = new Chart(tdsCtx, {
    ...chartConfig,
    data: {
        labels: [],
        datasets: [{ 
            label: 'TDS (ppm)', 
            data: [], 
            borderColor: 'blue', 
            fill: false 
        }]
    }
});

const turbidityChart = new Chart(turbidityCtx, {
    ...chartConfig,
    data: {
        labels: [],
        datasets: [{ 
            label: 'Turbidity (NTU)', 
            data: [], 
            borderColor: 'green', 
            fill: false 
        }]
    }
});

const phChart = new Chart(phCtx, {
    ...chartConfig,
    data: {
        labels: [],
        datasets: [{ 
            label: 'pH', 
            data: [], 
            borderColor: 'orange', 
            fill: false 
        }]
    },
    options: {
        ...chartConfig.options,
        scales: {
            ...chartConfig.options.scales,
            y: { suggestedMax: 14 }
        }
    }
});

const tempChart = new Chart(tempCtx, {
    ...chartConfig,
    data: {
        labels: [],
        datasets: [{ 
            label: 'Temperature (°C)', 
            data: [], 
            borderColor: 'red', 
            fill: false 
        }]
    }
});

// Data fetching and update logic
async function fetchData() {
    try {
        const response = await fetch('/data');
        const data = await response.json();
        
        const labels = data.map(entry => entry.time);
        const lastEntry = data.length > 0 ? data[data.length - 1] : null;

       
        updateChart(tdsChart, labels, data.map(entry => entry.tds));
        updateChart(turbidityChart, labels, data.map(entry => entry.turbidity));
        updateChart(phChart, labels, data.map(entry => entry.ph));
        updateChart(tempChart, labels, data.map(entry => entry.temperature));

        
        if (lastEntry) {
            document.getElementById('tds').textContent = lastEntry.tds;
            document.getElementById('turbidity').textContent = lastEntry.turbidity;
            document.getElementById('ph').textContent = lastEntry.ph;
            document.getElementById('temperature').textContent = lastEntry.temperature;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function updateChart(chart, labels, data) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

setInterval(fetchData, 3000);
fetchData();