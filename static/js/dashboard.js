const tdsCtx = document.getElementById('tdsChart').getContext('2d');
const turbidityCtx = document.getElementById('turbidityChart').getContext('2d');
const phCtx = document.getElementById('phChart').getContext('2d');
const tempCtx = document.getElementById('temperatureChart').getContext('2d');

const safeRanges = {
    tds: { min: 50, max: 150 },
    turbidity: { min: 0, max: 5 }, 
    ph: { min: 6.5, max: 7.5 },
    temperature: { min: 10, max: 60 } 
};


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


function isInSafeRange(value, parameter) {
    const range = safeRanges[parameter];
    return value >= range.min && value <= range.max;
}


function updateParameterDisplay(id, value, parameter) {
    const element = document.getElementById(id);
    element.textContent = value;
    
    
    const parentElement = element.closest('p');
    
    
    parentElement.classList.remove('safe', 'unsafe', 'trend-warning');
    
    
    if (isInSafeRange(value, parameter)) {
        parentElement.classList.add('safe');
    } else {
        parentElement.classList.add('unsafe');
    }
}


function updateAlertBanner(data) {
    const alertBanner = document.getElementById('alert-banner');
    const unsafeParameters = [];
    
    if (!isInSafeRange(data.tds, 'tds')) unsafeParameters.push('TDS');
    if (!isInSafeRange(data.turbidity, 'turbidity')) unsafeParameters.push('Turbidity');
    if (!isInSafeRange(data.ph, 'ph')) unsafeParameters.push('pH');
    if (!isInSafeRange(data.temperature, 'temperature')) unsafeParameters.push('Temperature');
    
    if (unsafeParameters.length > 0) {
        alertBanner.textContent = `⚠️ Warning: ${unsafeParameters.join(', ')} outside safe range!`;
        alertBanner.style.display = 'block';
    } else {
        alertBanner.style.display = 'none';
    }
}


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
            updateParameterDisplay('tds', lastEntry.tds, 'tds');
            updateParameterDisplay('turbidity', lastEntry.turbidity, 'turbidity');
            updateParameterDisplay('ph', lastEntry.ph, 'ph');
            updateParameterDisplay('temperature', lastEntry.temperature, 'temperature');
            
            
            updateAlertBanner(lastEntry);
            
            
            const trendAnalysis = updateTrendAnalysis(lastEntry);
            
            
            for (const [param, info] of Object.entries(trendAnalysis)) {
                if (info.isDeviation) {
                    const element = document.getElementById(param);
                    if (element) {
                        const parentElement = element.closest('p');
                        parentElement.classList.add('trend-warning');
                    }
                }
            }
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