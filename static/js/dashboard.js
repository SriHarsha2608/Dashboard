const tdsCtx = document.getElementById('tdsChart').getContext('2d');
const turbidityCtx = document.getElementById('turbidityChart').getContext('2d');
const phCtx = document.getElementById('phChart').getContext('2d');
const tempCtx = document.getElementById('temperatureChart').getContext('2d');

// Define safe range limits
const safeRanges = {
    tds: { min: 0, max: 150 },
    turbidity: { min: 0, max: 1 }, // Assuming turbidity < 5 NTU is safe
    ph: { min: 6.5, max: 7.5 },
    temperature: { min: 10, max: 50 } // Assuming 10-35°C is a reasonable range
};

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

// Check if value is within safe range
function isInSafeRange(value, parameter) {
    const range = safeRanges[parameter];
    return value >= range.min && value <= range.max;
}

// Update parameter display with alert styling if needed
function updateParameterDisplay(id, value, parameter) {
    const element = document.getElementById(id);
    element.textContent = value;
    
    // Get the parent element (paragraph)
    const parentElement = element.closest('p');
    
    // Remove existing status classes
    parentElement.classList.remove('safe', 'unsafe');
    
    // Add appropriate class based on safety
    if (isInSafeRange(value, parameter)) {
        parentElement.classList.add('safe');
    } else {
        parentElement.classList.add('unsafe');
    }
}

// Update alert banner
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
            updateParameterDisplay('tds', lastEntry.tds, 'tds');
            updateParameterDisplay('turbidity', lastEntry.turbidity, 'turbidity');
            updateParameterDisplay('ph', lastEntry.ph, 'ph');
            updateParameterDisplay('temperature', lastEntry.temperature, 'temperature');
            
            // Update the alert banner
            updateAlertBanner(lastEntry);
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