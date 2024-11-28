from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import requests
import joblib
from datetime import datetime, timedelta, timezone
import pytz

app = Flask(__name__)
CORS(app)

API_KEY = 'bb5bc6705ec5752cb4951b0774ffa9d2'
LAT = '10.8231'
LON = '106.6297'

model = joblib.load('model/theo_ngay_air_quality_predictor_model_demo2.joblib')

def convert_to_vietnam_time(utc_timestamp):
    utc_time = datetime.fromtimestamp(utc_timestamp, timezone.utc)
    vietnam_tz = pytz.timezone('Asia/Ho_Chi_Minh')
    return utc_time.astimezone(vietnam_tz)

def get_air_quality_data(lat, lon, start_timestamp, end_timestamp):
    url = f"http://api.openweathermap.org/data/2.5/air_pollution/history?lat={lat}&lon={lon}&start={start_timestamp}&end={end_timestamp}&appid={API_KEY}"
    response = requests.get(url)
    return response.json()

@app.route('/predict_day', methods=['GET'])
def predict_aqi():
    now = datetime.now()
    start_date = now
    end_date = now + timedelta(days=7)

    start_timestamp = int(start_date.timestamp())
    end_timestamp = int(end_date.timestamp())

    data = get_air_quality_data(LAT, LON, start_timestamp, end_timestamp)

    air_quality_data = []
    for entry in data.get('list', []):
        vietnam_time = convert_to_vietnam_time(entry['dt'])
        components = entry['components']
        air_quality_data.append({
            'date': vietnam_time.date(),
            'PM2.5': components.get('pm2_5', np.nan),
            'PM10': components.get('pm10', np.nan),
            'CO': components.get('co', np.nan),
            'NO2': components.get('no2', np.nan),
            'O3': components.get('o3', np.nan),
            'SO2': components.get('so2', np.nan),
        })

    df = pd.DataFrame(air_quality_data).dropna()
    if df.empty:
        return jsonify({'status': 'fail', 'message': 'No data to predict'}), 400

    daily_avg_data = df.groupby('date').mean().reset_index()
    X = daily_avg_data[['PM2.5', 'PM10', 'CO', 'NO2', 'O3', 'SO2']]
    predictions = model.predict(X)

    results = [{'date': str(row['date']), 'predicted_AQI': pred} for row, pred in zip(daily_avg_data.to_dict('records'), predictions)]
    return jsonify({'status': 'success', 'data': results})

if __name__ == '__main__':
    app.run(debug=True)

    