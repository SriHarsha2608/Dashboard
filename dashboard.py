# from flask import Flask, request, jsonify, render_template
# from datetime import datetime
# from collections import deque

# app = Flask(__name__)

# # Store the last 100 readings
# data_store = deque(maxlen=100)

# @app.route('/')
# def index():
#     return '''
#     <!DOCTYPE html>
#     <html>
#     <head>
#         <title>Water Quality Dashboard</title>
#         <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
#     </head>
#     <body>
#         <h2>Live Water Quality Dashboard</h2>
#         <p><strong>TDS:</strong> <span id="tds">--</span> ppm</p>
#         <p><strong>Turbidity:</strong> <span id="turbidity">--</span> NTU</p>
#         <p><strong>pH:</strong> <span id="ph">--</span></p>
#         <p><strong>Temperature:</strong> <span id="temperature">--</span> °C</p>

#         <canvas id="chart" width="400" height="200"></canvas>
#         <canvas id="phChart" width="400" height="200"></canvas>
#         <canvas id="tempChart" width="400" height="200"></canvas>

#         <script>
#         const tdsElement = document.getElementById('tds');
#         const turbidityElement = document.getElementById('turbidity');
#         const phElement = document.getElementById('ph');
#         const tempElement = document.getElementById('temperature');

#         const ctx = document.getElementById('chart').getContext('2d');
#         const phCtx = document.getElementById('phChart').getContext('2d');
#         const tempCtx = document.getElementById('tempChart').getContext('2d');

#         const chart = new Chart(ctx, {
#             type: 'line',
#             data: {
#                 labels: [],
#                 datasets: [
#                     {
#                         label: 'TDS (ppm)',
#                         borderColor: 'blue',
#                         fill: false,
#                         data: []
#                     },
#                     {
#                         label: 'Turbidity (NTU)',
#                         borderColor: 'green',
#                         fill: false,
#                         data: []
#                     }
#                 ]
#             },
#             options: {
#                 responsive: true,
#                 scales: {
#                     x: {
#                         title: { display: true, text: 'Time' }
#                     },
#                     y: {
#                         beginAtZero: true
#                     }
#                 }
#             }
#         });

#         const phChart = new Chart(phCtx, {
#             type: 'line',
#             data: {
#                 labels: [],
#                 datasets: [
#                     {
#                         label: 'pH',
#                         borderColor: 'orange',
#                         fill: false,
#                         data: []
#                     }
#                 ]
#             },
#             options: {
#                 responsive: true,
#                 scales: {
#                     x: {
#                         title: { display: true, text: 'Time' }
#                     },
#                     y: {
#                         beginAtZero: true,
#                         suggestedMax: 14
#                     }
#                 }
#             }
#         });

#         const tempChart = new Chart(tempCtx, {
#             type: 'line',
#             data: {
#                 labels: [],
#                 datasets: [
#                     {
#                         label: 'Temperature (°C)',
#                         borderColor: 'red',
#                         fill: false,
#                         data: []
#                     }
#                 ]
#             },
#             options: {
#                 responsive: true,
#                 scales: {
#                     x: {
#                         title: { display: true, text: 'Time' }
#                     },   
#                     y: {
#                         beginAtZero: true
#                     }
#                 }
#             }
#         });

#         async function fetchData() {
#             const response = await fetch('/data');
#             const data = await response.json();

#             const labels = data.map(entry => entry.time);
#             const tdsData = data.map(entry => entry.tds);
#             const turbidityData = data.map(entry => entry.turbidity);
#             const phData = data.map(entry => entry.ph);
#             const tempData = data.map(entry => entry.temperature);

#             chart.data.labels = labels;
#             chart.data.datasets[0].data = tdsData;
#             chart.data.datasets[1].data = turbidityData;
#             chart.update();

#             phChart.data.labels = labels;
#             phChart.data.datasets[0].data = phData;
#             phChart.update();

#             tempChart.data.labels = labels;
#             tempChart.data.datasets[0].data = tempData;
#             tempChart.update();

#             if (data.length > 0) {
#                 const last = data[data.length - 1];
#                 tdsElement.innerText = last.tds;
#                 turbidityElement.innerText = last.turbidity;
#                 phElement.innerText = last.ph;
#                 tempElement.innerText = last.temperature;
#             }
#         }

#         setInterval(fetchData, 3000);
#         fetchData();
#         </script>
#     </body>
#     </html>
#     '''

# @app.route('/data', methods=['POST'])
# def receive_data():
#     content = request.get_json()
#     tds = content.get('tds')
#     turbidity = content.get('turbidity')
#     ph = content.get('ph')
#     temperature = content.get('temperature')
#     timestamp = datetime.now().strftime('%H:%M:%S')

#     if all(val is not None for val in [tds, turbidity, ph, temperature]):
#         data_store.append({
#             'tds': tds,
#             'turbidity': turbidity,
#             'ph': ph,
#             'temperature': temperature,
#             'time': timestamp
#         })
#         return jsonify({'status': 'success'}), 200
#     return jsonify({'status': 'fail', 'reason': 'Invalid data'}), 400

# @app.route('/data', methods=['GET'])
# def get_data():
#     return jsonify(list(data_store))

# if __name__ == '__main__':
#     app.run(debug=True, host='0.0.0.0')



# from flask import Flask, request, jsonify, render_template
# from datetime import datetime
# from collections import deque

# app = Flask(__name__)

# # Store the last 100 readings
# data_store = deque(maxlen=100)

# @app.route('/')
# def index():
#     return render_template('index.html')

# @app.route('/data', methods=['POST'])
# def receive_data():
#     content = request.get_json()
#     tds = content.get('tds')
#     turbidity = content.get('turbidity')
#     ph = content.get('ph')
#     temperature = content.get('temperature')
#     timestamp = datetime.now().strftime('%H:%M:%S')

#     if all(val is not None for val in [tds, turbidity, ph, temperature]):
#         data_store.append({
#             'tds': tds,
#             'turbidity': turbidity,
#             'ph': ph,
#             'temperature': temperature,
#             'time': timestamp
#         })
#         return jsonify({'status': 'success'}), 200
#     return jsonify({'status': 'fail', 'reason': 'Invalid data'}), 400

# @app.route('/data', methods=['GET'])
# def get_data():
#     return jsonify(list(data_store))

# if __name__ == '__main__':
#     app.run(debug=True)


from flask import Flask, request, jsonify, render_template
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
import os

# Initialize Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sensor_data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Database Model
class SensorReading(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    tds = db.Column(db.Float)
    turbidity = db.Column(db.Float)
    ph = db.Column(db.Float)
    temperature = db.Column(db.Float)

# Create database tables
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data', methods=['POST'])
def receive_data():
    try:
        content = request.get_json()
        new_reading = SensorReading(
            tds=content['tds'],
            turbidity=content['turbidity'],
            ph=content['ph'],
            temperature=content['temperature']
        )
        db.session.add(new_reading)
        db.session.commit()
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/data', methods=['GET'])
def get_data():
    readings = SensorReading.query.order_by(SensorReading.timestamp.desc()).limit(100).all()
    return jsonify([{
        'time': reading.timestamp.strftime('%H:%M:%S'),
        'tds': reading.tds,
        'turbidity': reading.turbidity,
        'ph': reading.ph,
        'temperature': reading.temperature
    } for reading in readings])

@app.route('/export/csv')
def export_csv():
    readings = SensorReading.query.all()
    csv_data = "timestamp,tds,turbidity,ph,temperature\n"
    for reading in readings:
        csv_data += f"{reading.timestamp},{reading.tds},{reading.turbidity},{reading.ph},{reading.temperature}\n"
    return Response(csv_data, mimetype='text/csv')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)