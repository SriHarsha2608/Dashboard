// // Trend analysis functionality for water quality monitoring
// // Place this file in your static/js directory

// // Configuration for trend analysis
// const trendConfig = {
//     // Number of data points to use for calculating moving average
//     windowSize: 5,
//     // Threshold for alerting (as percentage deviation from moving average)
//     thresholdPercent: {
//         tds: 20,
//         turbidity: 30,
//         ph: 10,
//         temperature: 15
//     },
//     // Minimum number of points needed before analysis begins
//     minDataPoints: 5
// };

// // Store historical data for trend analysis
// let dataHistory = {
//     tds: [],
//     turbidity: [],
//     ph: [],
//     temperature: []
// };

// // Calculate moving average for a parameter
// function calculateMovingAverage(dataArray) {
//     if (dataArray.length < trendConfig.windowSize) return null;
    
//     // Use the most recent windowSize data points
//     const recentData = dataArray.slice(-trendConfig.windowSize);
//     const sum = recentData.reduce((total, value) => total + value, 0);
//     return sum / trendConfig.windowSize;
// }

// // Check if current value deviates significantly from trend
// function checkDeviation(parameter, currentValue) {
//     if (dataHistory[parameter].length < trendConfig.minDataPoints) return { isDeviation: false };
    
//     const movingAvg = calculateMovingAverage(dataHistory[parameter]);
//     if (movingAvg === null) return { isDeviation: false };
    
//     // Calculate deviation percentage
//     const deviationPercent = Math.abs((currentValue - movingAvg) / movingAvg * 100);
//     const threshold = trendConfig.thresholdPercent[parameter];
    
//     return {
//         isDeviation: deviationPercent > threshold,
//         currentValue: currentValue,
//         average: movingAvg,
//         deviationPercent: deviationPercent,
//         threshold: threshold
//     };
// }

// // Update trend analysis with new data point
// function updateTrendAnalysis(data) {
//     // Add new data points to history
//     dataHistory.tds.push(data.tds);
//     dataHistory.turbidity.push(data.turbidity);
//     dataHistory.ph.push(data.ph);
//     dataHistory.temperature.push(data.temperature);
    
//     // Limit history length to prevent memory issues (keep 50 points)
//     const maxHistoryLength = 50;
//     if (dataHistory.tds.length > maxHistoryLength) {
//         dataHistory.tds = dataHistory.tds.slice(-maxHistoryLength);
//         dataHistory.turbidity = dataHistory.turbidity.slice(-maxHistoryLength);
//         dataHistory.ph = dataHistory.ph.slice(-maxHistoryLength);
//         dataHistory.temperature = dataHistory.temperature.slice(-maxHistoryLength);
//     }
    
//     // Check for deviations
//     const deviations = {
//         tds: checkDeviation('tds', data.tds),
//         turbidity: checkDeviation('turbidity', data.turbidity),
//         ph: checkDeviation('ph', data.ph),
//         temperature: checkDeviation('temperature', data.temperature)
//     };
    
//     // Update UI with deviation information
//     displayTrendAlerts(deviations);
    
//     return deviations;
// }

// // Display trend alerts in the UI
// function displayTrendAlerts(deviations) {
//     const trendAlertBanner = document.getElementById('trend-alert-banner');
//     const alertDetails = document.getElementById('trend-alert-details');
    
//     // Clear previous alerts
//     alertDetails.innerHTML = '';
    
//     // Check if any parameter has a deviation
//     const deviatingParams = [];
    
//     for (const [param, info] of Object.entries(deviations)) {
//         if (info.isDeviation) {
//             deviatingParams.push(param);
            
//             // Create alert detail element
//             const alertElement = document.createElement('div');
//             alertElement.className = 'trend-alert-item';
//             alertElement.innerHTML = `
//                 <strong>${param.toUpperCase()}</strong>: 
//                 Current value (${info.currentValue.toFixed(2)}) deviates by 
//                 ${info.deviationPercent.toFixed(1)}% from recent average (${info.average.toFixed(2)})
//             `;
//             alertDetails.appendChild(alertElement);
//         }
//     }
    
//     // Show or hide the alert banner
//     if (deviatingParams.length > 0) {
//         trendAlertBanner.textContent = `⚠️ Unusual trends detected in: ${deviatingParams.join(', ')}`;
//         trendAlertBanner.style.display = 'block';
//         alertDetails.style.display = 'block';
//     } else {
//         trendAlertBanner.style.display = 'none';
//         alertDetails.style.display = 'none';
//     }
// }


// Trend analysis functionality for water quality monitoring
// Place this file in your static/js directory

// Configuration for trend analysis
const trendConfig = {
    // Number of data points to use for calculating moving average
    windowSize: 3, // Reduced from 5 to make it more sensitive
    // Threshold for alerting (as percentage deviation from moving average)
    thresholdPercent: {
        tds: 10, // Reduced from 20 to be more sensitive
        turbidity: 15, // Reduced from 30
        ph: 5, // Reduced from 10
        temperature: 8 // Reduced from 15
    },
    // Minimum number of points needed before analysis begins
    minDataPoints: 3 // Reduced from 5
};

// Store historical data for trend analysis
let dataHistory = {
    tds: [],
    turbidity: [],
    ph: [],
    temperature: []
};

// Calculate moving average for a parameter
function calculateMovingAverage(dataArray) {
    if (dataArray.length < trendConfig.windowSize) return null;
    
    // Use the most recent windowSize data points
    const recentData = dataArray.slice(-trendConfig.windowSize);
    const sum = recentData.reduce((total, value) => total + value, 0);
    return sum / trendConfig.windowSize;
}

// Check if current value deviates significantly from trend
function checkDeviation(parameter, currentValue) {
    if (dataHistory[parameter].length < trendConfig.minDataPoints) {
        console.log(`${parameter}: Not enough data points yet (${dataHistory[parameter].length}/${trendConfig.minDataPoints})`);
        return { isDeviation: false };
    }
    
    const movingAvg = calculateMovingAverage(dataHistory[parameter]);
    if (movingAvg === null) return { isDeviation: false };
    
    // Calculate deviation percentage
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

// Update trend analysis with new data point
function updateTrendAnalysis(data) {
    console.log("Updating trend analysis with:", data);
    
    // Add new data points to history
    dataHistory.tds.push(data.tds);
    dataHistory.turbidity.push(data.turbidity);
    dataHistory.ph.push(data.ph);
    dataHistory.temperature.push(data.temperature);
    
    // Log the current history sizes
    console.log(`History sizes - TDS: ${dataHistory.tds.length}, Turbidity: ${dataHistory.turbidity.length}, pH: ${dataHistory.ph.length}, Temp: ${dataHistory.temperature.length}`);
    
    // Limit history length to prevent memory issues (keep 50 points)
    const maxHistoryLength = 50;
    if (dataHistory.tds.length > maxHistoryLength) {
        dataHistory.tds = dataHistory.tds.slice(-maxHistoryLength);
        dataHistory.turbidity = dataHistory.turbidity.slice(-maxHistoryLength);
        dataHistory.ph = dataHistory.ph.slice(-maxHistoryLength);
        dataHistory.temperature = dataHistory.temperature.slice(-maxHistoryLength);
    }
    
    // Check for deviations
    const deviations = {
        tds: checkDeviation('tds', data.tds),
        turbidity: checkDeviation('turbidity', data.turbidity),
        ph: checkDeviation('ph', data.ph),
        temperature: checkDeviation('temperature', data.temperature)
    };
    
    // Count deviations
    const deviationCount = Object.values(deviations).filter(d => d.isDeviation).length;
    console.log(`Found ${deviationCount} parameters with significant deviations`);
    
    // Update UI with deviation information
    displayTrendAlerts(deviations);
    
    return deviations;
}

// Display trend alerts in the UI
function displayTrendAlerts(deviations) {
    // Check if elements exist
    const trendAlertBanner = document.getElementById('trend-alert-banner');
    const alertDetails = document.getElementById('trend-alert-details');
    
    if (!trendAlertBanner || !alertDetails) {
        console.error("Required trend alert elements not found in the DOM!");
        console.error("trend-alert-banner exists:", !!trendAlertBanner);
        console.error("trend-alert-details exists:", !!alertDetails);
        return;
    }
    
    // Clear previous alerts
    alertDetails.innerHTML = '';
    
    // Check if any parameter has a deviation
    const deviatingParams = [];
    
    for (const [param, info] of Object.entries(deviations)) {
        if (info.isDeviation) {
            deviatingParams.push(param);
            
            // Create alert detail element
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
    
    // Show or hide the alert banner
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

// Add a manual test function to simulate a deviation
// Call this from the console to test: simulateDeviation()
function simulateDeviation() {
    console.log("Simulating a deviation for testing...");
    
    // Add some baseline data
    for (let i = 0; i < 5; i++) {
        dataHistory.tds.push(100);
        dataHistory.turbidity.push(0.5);
        dataHistory.ph.push(7.0);
        dataHistory.temperature.push(25);
    }
    
    // Then add a deviation
    const testData = {
        tds: 150, // 50% higher
        turbidity: 0.8, // 60% higher
        ph: 7.0, // no change
        temperature: 25 // no change
    };
    
    updateTrendAnalysis(testData);
    console.log("Simulation complete - check if alert appeared");
}

// Make the test function available globally
window.simulateDeviation = simulateDeviation;