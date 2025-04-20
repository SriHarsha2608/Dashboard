import os
from flask import Flask, request, jsonify, render_template, Response
from datetime import datetime, timezone, timedelta
from flask_sqlalchemy import SQLAlchemy

# Initialize Flask app
# IMPORTANT: Initialize Flask *before* using app.instance_path
app = Flask(__name__, instance_relative_config=True) # Use instance_relative_config=True

# --- Configuration ---
# Get the absolute path to the instance folder
# Flask automatically determines this based on the app's root path
instance_path = app.instance_path
db_path = os.path.join(instance_path, 'sensor_data.db')
db_uri = 'sqlite:///' + db_path # 3 slashes for relative/absolute path from root

print(f"--- Database Configuration ---")
print(f"Flask Instance Path: {instance_path}")
print(f"Database file path: {db_path}")
print(f"Database URI: {db_uri}")
print(f"-----------------------------")

# Ensure the instance folder exists *before* trying to use it
try:
    os.makedirs(instance_path, exist_ok=True)
    print(f"Ensured instance folder exists: {instance_path}")
except OSError as e:
    print(f"ERROR: Could not create instance folder {instance_path}: {e}")
    # Decide how critical this is. Exit if needed.
    # exit(1)

app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# You could also load other config from instance/config.py if needed
# app.config.from_pyfile('config.py', silent=True)

db = SQLAlchemy(app)

# --- Helper function for IST timestamp ---
def get_ist_now():
    """Get current datetime in IST (UTC+5:30)"""
    return datetime.now(timezone.utc).astimezone(timezone(timedelta(hours=5, minutes=30)))

# --- Database Model ---
# Modified to use IST timezone
class SensorReading(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=get_ist_now)
    tds = db.Column(db.Float)
    turbidity = db.Column(db.Float)
    ph = db.Column(db.Float)
    temperature = db.Column(db.Float)

    def __repr__(self):
        return f"<SensorReading(id={self.id}, timestamp={self.timestamp}, tds={self.tds})>"

# --- Database Initialization ---
with app.app_context():
    print("Attempting to create database tables if they don't exist...")
    try:
        db.create_all()
        print(f"Database tables ensured at: {db_path}")
    except Exception as e:
        print(f"ERROR: Could not create database tables at {db_path}: {e}")
        # exit(1)

# --- Routes ---
@app.route('/')
def index():
    """Serves the main dashboard HTML page."""
    # print("Serving index.html") # Optional logging
    return render_template('index.html')

@app.route('/history')
def history():
    """Serves the history page."""
    return render_template('history.html')

@app.route('/data', methods=['POST'])
def receive_data():
    """Receives sensor data via POST request and stores it in the database."""
    print("\n--- Received POST request to /data ---")
    db_updated = False
    try:
        content = request.get_json()
        if not content:
            print("ERROR: No JSON data received in POST request.")
            return jsonify({'status': 'error', 'message': 'No JSON data received'}), 400
        print(f"Received JSON data: {content}")

        required_keys = ['tds', 'turbidity', 'ph', 'temperature']
        if not all(key in content for key in required_keys):
             msg = f'Missing data keys. Required: {required_keys}, Got: {list(content.keys())}'
             print(f"ERROR: {msg}")
             return jsonify({'status': 'error', 'message': msg}), 400

        # Using IST timestamp
        new_reading = SensorReading(
            timestamp=get_ist_now(),
            tds=float(content['tds']),
            turbidity=float(content['turbidity']),
            ph=float(content['ph']),
            temperature=float(content['temperature'])
        )
        print(f"Created SensorReading object: {new_reading!r}")

        print("Attempting to add to session...")
        db.session.add(new_reading)
        print("Added to session. Attempting to commit...")
        db.session.commit()
        db_updated = True
        print(f"SUCCESS: Database commit successful! Record ID: {new_reading.id}, Timestamp (IST): {new_reading.timestamp}")
        return jsonify({'status': 'success'}), 201

    except Exception as e:
        print(f"ERROR during POST /data processing: {e}")
        if not db_updated:
            print("Rolling back database session due to error.")
            db.session.rollback()
        else:
             print("Error occurred AFTER commit.")
        return jsonify({'status': 'error', 'message': f"Internal server error: {str(e)}"}), 500

@app.route('/data', methods=['GET'])
def get_data():
    """Sends the latest sensor data (up to 100 points) to the frontend."""
    try:
        readings = SensorReading.query.order_by(SensorReading.timestamp.desc()).limit(100).all()
        readings.reverse()
        readings_for_json = [{
            'time': reading.timestamp.strftime('%H:%M:%S'),
            'tds': reading.tds,
            'turbidity': reading.turbidity,
            'ph': reading.ph,
            'temperature': reading.temperature
        } for reading in readings]
        return jsonify(readings_for_json)
    except Exception as e:
        print(f"ERROR during GET /data processing: {e}")
        return jsonify({'status': 'error', 'message': f"Internal server error: {str(e)}"}), 500

@app.route('/history/data')
def get_historical_data():
    """Sends data for the past 4 days."""
    try:
        # Calculate the date 4 days ago from now
        four_days_ago = get_ist_now() - timedelta(days=4)
        
        # Get readings from the past 4 days
        readings = SensorReading.query.filter(
            SensorReading.timestamp >= four_days_ago
        ).order_by(SensorReading.timestamp.desc()).all()
        
        # Format the data for JSON response
        readings_for_json = [{
            'date': reading.timestamp.strftime('%Y-%m-%d'),
            'time': reading.timestamp.strftime('%H:%M:%S'),
            'tds': reading.tds,
            'turbidity': reading.turbidity,
            'ph': reading.ph,
            'temperature': reading.temperature
        } for reading in readings]
        
        return jsonify(readings_for_json)
    except Exception as e:
        print(f"ERROR during GET /history/data processing: {e}")
        return jsonify({'status': 'error', 'message': f"Internal server error: {str(e)}"}), 500

@app.route('/export/csv')
def export_csv():
    """Exports all sensor data as a CSV file."""
    print("Received request to /export/csv")
    try:
        readings = SensorReading.query.order_by(SensorReading.timestamp.asc()).all()
        print(f"Fetched {len(readings)} records for CSV export.")
        import io
        import csv
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["timestamp_ist", "tds", "turbidity", "ph", "temperature"])  # Changed header to IST
        for reading in readings:
            formatted_timestamp = reading.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            writer.writerow([formatted_timestamp, reading.tds, reading.turbidity, reading.ph, reading.temperature])
        csv_data = output.getvalue()
        output.close()
        return Response(
            csv_data,
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment;filename=sensor_data.csv'}
        )
    except Exception as e:
        print(f"ERROR during /export/csv processing: {e}")
        return "Error generating CSV file.", 500

# --- Main Execution ---
if __name__ == '__main__':
    print("Starting Flask development server...")
    # Now, when debugging, ensure you are checking the file at the path printed above,
    # which will be inside the 'instance' folder next to your dashboard.py script's location.
    app.run(host='0.0.0.0', port=5000, debug=True)