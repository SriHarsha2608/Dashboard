const trendConfig = {
    windowSize: 3,
    
    thresholdPercent: {
        tds: 10, 
        turbidity: 15, 
        ph: 5, 
        temperature: 8 
    },
    
    minDataPoints: 3 
};

let dataHistory = {
    tds: [],
    turbidity: [],
    ph: [],
    temperature: []
};


function calculateMovingAverage(dataArray) {
    if (dataArray.length < trendConfig.windowSize) return null;
    
   
    const recentData = dataArray.slice(-trendConfig.windowSize);
    const sum = recentData.reduce((total, value) => total + value, 0);
    return sum / trendConfig.windowSize;
}

function checkDeviation(parameter, currentValue) {
    if (dataHistory[parameter].length < trendConfig.minDataPoints) {
        console.log(`${parameter}: Not enough data points yet (${dataHistory[parameter].length}/${trendConfig.minDataPoints})`);
        return { isDeviation: false };
    }
    
    const movingAvg = calculateMovingAverage(dataHistory[parameter]);
    if (movingAvg === null) return { isDeviation: false };
    
    const deviationPercent = Math.abs((currentValue - movingAvg) / movingAvg * 100);
    const threshold = trendConfig.thresholdPercent[parameter];
    
    console.log(`${parameter}: Current=${currentValue.toFixed(2)}, Avg=${movingAvg.toFixed(2)}, Deviation=${deviationPercent.toFixed(1)}%, Threshold=${threshold}%`);
    
    return {
        isDeviation: deviationPercent > threshold,
        currentValue: currentValue,
        average: movingAvg,
        deviationPercent: deviationPercent,
        threshold: threshold
    };
}

function updateTrendAnalysis(data) {
    console.log("Updating trend analysis with:", data);
    
    dataHistory.tds.push(data.tds);
    dataHistory.turbidity.push(data.turbidity);
    dataHistory.ph.push(data.ph);
    dataHistory.temperature.push(data.temperature);
    
    console.log(`History sizes - TDS: ${dataHistory.tds.length}, Turbidity: ${dataHistory.turbidity.length}, pH: ${dataHistory.ph.length}, Temp: ${dataHistory.temperature.length}`);
    
    const maxHistoryLength = 50;
    if (dataHistory.tds.length > maxHistoryLength) {
        dataHistory.tds = dataHistory.tds.slice(-maxHistoryLength);
        dataHistory.turbidity = dataHistory.turbidity.slice(-maxHistoryLength);
        dataHistory.ph = dataHistory.ph.slice(-maxHistoryLength);
        dataHistory.temperature = dataHistory.temperature.slice(-maxHistoryLength);
    }
    
    const deviations = {
        tds: checkDeviation('tds', data.tds),
        turbidity: checkDeviation('turbidity', data.turbidity),
        ph: checkDeviation('ph', data.ph),
        temperature: checkDeviation('temperature', data.temperature)
    };
    
    const deviationCount = Object.values(deviations).filter(d => d.isDeviation).length;
    console.log(`Found ${deviationCount} parameters with significant deviations`);
    
    displayTrendAlerts(deviations);
    
    return deviations;
}

function displayTrendAlerts(deviations) {
    const trendAlertBanner = document.getElementById('trend-alert-banner');
    const alertDetails = document.getElementById('trend-alert-details');
    
    if (!trendAlertBanner || !alertDetails) {
        console.error("Required trend alert elements not found in the DOM!");
        console.error("trend-alert-banner exists:", !!trendAlertBanner);
        console.error("trend-alert-details exists:", !!alertDetails);
        return;
    }
    
    alertDetails.innerHTML = '';
    
    const deviatingParams = [];
    
    for (const [param, info] of Object.entries(deviations)) {
        if (info.isDeviation) {
            deviatingParams.push(param);
            
            const alertElement = document.createElement('div');
            alertElement.className = 'trend-alert-item';
            alertElement.innerHTML = `
                <strong>${param.toUpperCase()}</strong>: 
                Current value (${info.currentValue.toFixed(2)}) deviates by 
                ${info.deviationPercent.toFixed(1)}% from recent average (${info.average.toFixed(2)})
            `;
            alertDetails.appendChild(alertElement);
            
            console.log(`Adding trend alert for ${param}`);
        }
    }
    
    if (deviatingParams.length > 0) {
        trendAlertBanner.textContent = `⚠️ Unusual trends detected in: ${deviatingParams.join(', ')}`;
        trendAlertBanner.style.display = 'block';
        alertDetails.style.display = 'block';
        console.log("Displaying trend alert banner with message:", trendAlertBanner.textContent);
    } else {
        trendAlertBanner.style.display = 'none';
        alertDetails.style.display = 'none';
        console.log("Hiding trend alert banner - no deviations");
    }
}

function simulateDeviation() {
    console.log("Simulating a deviation for testing...");
    
    for (let i = 0; i < 5; i++) {
        dataHistory.tds.push(100);
        dataHistory.turbidity.push(0.5);
        dataHistory.ph.push(7.0);
        dataHistory.temperature.push(25);
    }
    
    const testData = {
        tds: 150, 
        turbidity: 0.8, 
        ph: 7.0, 
        temperature: 25 
    };
    
    updateTrendAnalysis(testData);
    console.log("Simulation complete - check if alert appeared");
}

window.simulateDeviation = simulateDeviation;