from flask import Flask, jsonify
from flask_cors import CORS 
import requests
import pandas as pd
import numpy as np
import joblib
from tensorflow.keras.models import load_model
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

# Environment Variables
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

# Thiết lập Flask
app = Flask(__name__)
CORS(app)

# Tải mô hình đã được huấn luyện 
model_filename = 'model/tai_theo_ngay_25_11_mlp_air_quality_model_daily.joblib'
best_model = joblib.load(model_filename)

# Thêm đường dẫn đến model mới
hourly_model_path = 'model/maigiang_25_11_theo_gio_bilstm_aqi_model.keras'
hourly_model = load_model(hourly_model_path)

# Cấu hình API
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
LAT = 10.8231  # Vĩ độ của Thành phố Hồ Chí Minh  
LON = 106.6297  # Kinh độ của Thành phố Hồ Chí Minh  

# Hàm lấy dữ liệu chất lượng không khí hiện tại từ API 
def get_air_quality_data():
    url = f'http://api.openweathermap.org/data/2.5/air_pollution?lat={LAT}&lon={LON}&appid={OPENWEATHER_API_KEY}'
    response = requests.get(url)
    return response.json()

# Hàm lấy dữ liệu chất lượng không khí của 7 ngày 
def get_air_quality_data_7_days():
    try:
        current_data = get_air_quality_data()
        if 'list' not in current_data:
            return None

        current_components = current_data['list'][0]['components']
        current_air_quality = [
            current_components['pm2_5'],
            current_components['pm10'],
            current_components['co'],
            current_components['so2']
        ]

        air_quality_7_days = [current_air_quality] 

        for i in range(6):
            timestamp = int((pd.Timestamp.now() - pd.Timedelta(days=i + 1)).timestamp())
            historical_url = f'http://api.openweathermap.org/data/2.5/air_pollution/history?lat={LAT}&lon={LON}&start={timestamp}&end={timestamp + 86400}&appid={OPENWEATHER_API_KEY}'
            historical_response = requests.get(historical_url)

            if historical_response.status_code == 200:
                historical_data = historical_response.json()
                if 'list' in historical_data:
                    historical_components = historical_data['list'][0]['components']
                    air_quality_7_days.append([
                        historical_components['pm2_5'],
                        historical_components['pm10'],
                        historical_components['co'],
                        historical_components['so2']
                    ])
        
        df_7_days = pd.DataFrame(air_quality_7_days[::-1], columns=['PM2.5', 'PM10', 'CO', 'SO2'])
        return df_7_days
    except Exception as e:
        print(f"Lỗi khi lấy dữ liệu: {e}")
        return None

@app.route('/predict_day', methods=['GET'])
def predict_aqi():
    try:
        # Hàm lấy dữ liệu từ API
        def get_air_quality_data(timestamp):
            url = f'http://api.openweathermap.org/data/2.5/air_pollution/history?lat={LAT}&lon={LON}&start={timestamp}&end={timestamp + 86400}&appid={OPENWEATHER_API_KEY}'
            response = requests.get(url)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error fetching data: {response.status_code}")
                return None

        # Hàm xử lý dữ liệu trung bình ngày
        def process_daily_average(data):
            if 'list' not in data:
                return None

            daily_components = pd.DataFrame([item['components'] for item in data['list']])
            return daily_components.mean().to_dict()

        # Lấy dữ liệu 7 ngày quá khứ
        def get_air_quality_past_7_days():
            air_quality_7_days = []
            for i in range(7):
                timestamp = int((pd.Timestamp.now() - pd.Timedelta(days=i + 1)).timestamp())
                historical_data = get_air_quality_data(timestamp)
                if historical_data:
                    daily_avg = process_daily_average(historical_data)
                    if daily_avg:
                        air_quality_7_days.append(daily_avg)

            # Chuyển đổi thành DataFrame
            df_7_days = pd.DataFrame(air_quality_7_days[::-1])  # Đảo ngược thứ tự
            return df_7_days

        # Lấy dữ liệu chất lượng không khí của 7 ngày qua
        df_past_7_days = get_air_quality_past_7_days()
        if df_past_7_days is None or df_past_7_days.empty:
            return jsonify({"status": "error", "message": "Không thể lấy dữ liệu từ API."}), 500

        # Chọn đúng các đặc trưng mà mô hình đã học
        selected_features = ['pm2_5', 'pm10', 'co', 'so2']
        if not all(feature in df_past_7_days.columns for feature in selected_features):
            return jsonify({"status": "error", "message": "Thiếu dữ liệu đặc trưng cần thiết."}), 500
        df_past_7_days = df_past_7_days[selected_features]

        # Kiểm tra và xử lý NaN
        if df_past_7_days.isnull().values.any():
            print("Dữ liệu chứa giá trị NaN. Đang xử lý...")
            df_past_7_days.fillna(df_past_7_days.mean(), inplace=True)

        # Chuẩn hóa dữ liệu (min-max scaling) 
        def min_max_scaling(data, min_val=0, max_val=1):
            return (data - data.min()) / (data.max() - data.min()) * (max_val - min_val) + min_val

        X_scaled = df_past_7_days.apply(min_max_scaling)

        # Dự đoán AQI cho 7 ngày tiếp theo 
        y_pred_7_days = best_model.predict(X_scaled)

        # Giới hạn giá trị AQI nếu cần
        y_pred_7_days = np.clip(y_pred_7_days, 0, 5)

        # Tạo danh sách ngày cho 7 ngày tiếp theo
        dates_7_days = [(pd.Timestamp.now() + pd.Timedelta(days=i + 1)).strftime('%Y-%m-%d') for i in range(7)]

        # Chuẩn bị kết quả để trả về
        prediction_results = [
            {"date": date, "predicted_AQI": float(aqi)} for date, aqi in zip(dates_7_days, y_pred_7_days)
        ]

        # Trả về kết quả dự đoán
        return jsonify({
            "status": "success",
            "data": prediction_results,
            "metadata": {
                "model_info": "MLP Air Quality Model Daily",
                "prediction_time": pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
            }
        })

    except Exception as e:
        print(f"Error in predict_aqi: {str(e)}")  # Log lỗi chi tiết
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/predict_hourly', methods=['GET'])
def predict_hourly_aqi():
    try:
        # Sử dụng datetime.now(timezone.utc) thay vì utcnow()
        hours = 500
        end_time = int(datetime.now(timezone.utc).timestamp())
        start_time = int((datetime.now(timezone.utc) - timedelta(hours=hours)).timestamp())
        
        url = f'http://api.openweathermap.org/data/2.5/air_pollution/history?lat={LAT}&lon={LON}&start={start_time}&end={end_time}&appid={OPENWEATHER_API_KEY}'
        
        response = requests.get(url)
        if response.status_code != 200:
            return jsonify({"status": "error", "message": "Không thể lấy dữ liệu từ API"}), 500

        # Xử lý dữ liệu
        data = response.json()
        records = []
        for item in data['list']:
            # Sử dụng fromtimestamp với timezone.utc
            dt = datetime.fromtimestamp(item['dt'], tz=timezone.utc)
            components = item['components']
            records.append({
                'Datetime': dt,
                'PM2.5': components['pm2_5'],
                'PM10': components['pm10'],
                'CO': components['co'],
                'SO2': components['so2'],
                'AQI': item.get('main', {}).get('aqi', 0)
            })

        df = pd.DataFrame(records)
        df['Datetime'] = pd.to_datetime(df['Datetime'])
        df.set_index('Datetime', inplace=True)
        df.ffill(inplace=True)

        # Chuẩn hóa dữ liệu 
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(df[['PM2.5', 'PM10', 'CO', 'SO2', 'AQI']])
        df_scaled = pd.DataFrame(scaled_data, columns=['PM2.5', 'PM10', 'CO', 'SO2', 'AQI'])

        # Tạo sequences
        window_size = 48
        X_input = np.array([df_scaled.values[i - window_size:i] for i in range(window_size, len(df_scaled))])

        # Dự đoán 
        current_input = X_input[-1]
        future_predictions = []

        for _ in range(7):
            pred = hourly_model.predict(current_input[np.newaxis, :, :], verbose=0)
            future_predictions.append(pred[0, 0])
            current_input = np.append(current_input[1:], [[0, 0, 0, 0, pred[0, 0]]], axis=0)

        # Làm mượt dự đoán
        smoothed_predictions = pd.Series(future_predictions).rolling(window=3).mean().bfill()
        predictions_scaled = np.concatenate(
            (np.zeros((len(smoothed_predictions), df_scaled.shape[1] - 1)), smoothed_predictions.values.reshape(-1, 1)),
            axis=1
        )
        future_aqi = scaler.inverse_transform(predictions_scaled)[:, -1]

        # Tạo kết quả với múi giờ Việt Nam
        prediction_results = []
        vietnam_tz = ZoneInfo("Asia/Ho_Chi_Minh")
        
        for i, aqi in enumerate(future_aqi):
            # Lấy thời gian hiện tại theo múi giờ Việt Nam
            current_time = datetime.now(vietnam_tz)
            future_time = current_time + timedelta(hours=i + 1)
            
            prediction_results.append({
                "datetime": future_time.strftime('%Y-%m-%d %H:%M:%S'),
                "timezone": "Asia/Ho_Chi_Minh",
                "aqi": float(aqi)
            })

        return jsonify({
            "status": "success",
            "data": prediction_results
        })

    except Exception as e:
        print(f"Error in predict_hourly_aqi: {str(e)}")  # Thêm log để debug
        return jsonify({"status": "error", "message": str(e)}), 500

# Thêm CORS headers
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(debug=True, port=8000)




