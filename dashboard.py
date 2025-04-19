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
    readings = SensorReading.query.order_by(SensorReading.timestamp.asc()).limit(100).all()
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