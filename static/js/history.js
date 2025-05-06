const safeRanges = {
    tds: { min: 50, max: 500 },
    turbidity: { min: 0, max: 5 },
    ph: { min: 6.5, max: 7.5 },
    temperature: { min: 10, max: 60 }
};


let historicalData = [];
let dates = [];
let historicalChart = null;


document.addEventListener('DOMContentLoaded', async function() {
    await fetchHistoricalData();
    setupDateSelector();
    
    
    document.getElementById('date-select').addEventListener('change', function() {
        displaySelectedDateData(this.value);
    });
});


async function fetchHistoricalData() {
    try {
        const response = await fetch('/history/data');
        historicalData = await response.json();
        
        
        dates = [...new Set(historicalData.map(item => item.date))];
        
        
        if (dates.length > 0) {
            displaySelectedDateData(dates[0]);
        }
    } catch (error) {
        console.error('Error fetching historical data:', error);
    }
}


function setupDateSelector() {
    const dateSelect = document.getElementById('date-select');
    
    
    dateSelect.innerHTML = '';
    
    
    dates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = date;
        dateSelect.appendChild(option);
    });
}


function displaySelectedDateData(selectedDate) {
   
    const dayData = historicalData.filter(item => item.date === selectedDate);
    
    if (dayData.length === 0) return;
    
    
    document.getElementById('selected-date').textContent = selectedDate;
    
    
    const avgTds = calculateAverage(dayData, 'tds');
    const avgTurbidity = calculateAverage(dayData, 'turbidity');
    const avgPh = calculateAverage(dayData, 'ph');
    const avgTemp = calculateAverage(dayData, 'temperature');
    
    
    document.getElementById('avg-tds').textContent = avgTds.toFixed(2);
    document.getElementById('avg-turbidity').textContent = avgTurbidity.toFixed(2);
    document.getElementById('avg-ph').textContent = avgPh.toFixed(2);
    document.getElementById('avg-temp').textContent = avgTemp.toFixed(2);
    
    
    const isTdsSafe = avgTds >= safeRanges.tds.min && avgTds <= safeRanges.tds.max;
    const isTurbiditySafe = avgTurbidity >= safeRanges.turbidity.min && avgTurbidity <= safeRanges.turbidity.max;
    const isPhSafe = avgPh >= safeRanges.ph.min && avgPh <= safeRanges.ph.max;
    const isTempSafe = avgTemp >= safeRanges.temperature.min && avgTemp <= safeRanges.temperature.max;
    
    const safetyStatus = document.getElementById('safety-status');
    
    if (isTdsSafe && isTurbiditySafe && isPhSafe && isTempSafe) {
        safetyStatus.textContent = "Safe";
        safetyStatus.className = "safe";
    } else {
        const unsafeParams = [];
        if (!isTdsSafe) unsafeParams.push("TDS");
        if (!isTurbiditySafe) unsafeParams.push("Turbidity");
        if (!isPhSafe) unsafeParams.push("pH");
        if (!isTempSafe) unsafeParams.push("Temperature");
        
        safetyStatus.textContent = `Unsafe - Issues with: ${unsafeParams.join(', ')}`;
        safetyStatus.className = "unsafe";
    }
    
    
    updateChart(dayData);
    
    
    updateDataTable(dayData);
}


function calculateAverage(data, parameter) {
    const sum = data.reduce((acc, item) => acc + item[parameter], 0);
    return sum / data.length;
}


function isDataPointSafe(dataPoint) {
    return (
        dataPoint.tds >= safeRanges.tds.min && 
        dataPoint.tds <= safeRanges.tds.max &&
        dataPoint.turbidity >= safeRanges.turbidity.min && 
        dataPoint.turbidity <= safeRanges.turbidity.max &&
        dataPoint.ph >= safeRanges.ph.min && 
        dataPoint.ph <= safeRanges.ph.max &&
        dataPoint.temperature >= safeRanges.temperature.min && 
        dataPoint.temperature <= safeRanges.temperature.max
    );
}


function updateChart(dayData) {
    const ctx = document.getElementById('historicalChart').getContext('2d');
    
    if (historicalChart) {
        historicalChart.destroy();
    }
    
    const labels = dayData.map(item => item.time);
    
    historicalChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'TDS (ppm)',
                    data: dayData.map(item => item.tds),
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0, 0, 255, 0.1)',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Turbidity (NTU)',
                    data: dayData.map(item => item.turbidity),
                    borderColor: 'green',
                    backgroundColor: 'rgba(0, 128, 0, 0.1)',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'pH',
                    data: dayData.map(item => item.ph),
                    borderColor: 'orange',
                    backgroundColor: 'rgba(255, 165, 0, 0.1)',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Temperature (°C)',
                    data: dayData.map(item => item.temperature),
                    borderColor: 'red',
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    fill: false,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (IST)'
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateDataTable(dayData) {
    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = '';
    
    dayData.forEach(item => {
        const row = document.createElement('tr');
        
        const isSafe = isDataPointSafe(item);
        const statusClass = isSafe ? 'safe' : 'unsafe';
        const statusText = isSafe ? 'Safe' : 'Unsafe';
        
        row.innerHTML = `
            <td>${item.time}</td>
            <td>${item.tds.toFixed(2)}</td>
            <td>${item.turbidity.toFixed(2)}</td>
            <td>${item.ph.toFixed(2)}</td>
            <td>${item.temperature.toFixed(2)}</td>
            <td class="${statusClass}">${statusText}</td>
        `;
        
        tableBody.appendChild(row);
    });
}