# from flask import Flask, jsonify
# from flask_cors import CORS
# import pandas as pd
# import numpy as np
# import joblib
# import requests
# from datetime import datetime, timedelta

# app = Flask(__name__)
# CORS(app)

# # Configurations
# OPENWEATHER_API_KEY = 'bb5bc6705ec5752cb4951b0774ffa9d2'
# LAT = 10.8231  # Latitude for Ho Chi Minh City
# LON = 106.6297  # Longitude for Ho Chi Minh City

# # Load the pre-trained MLP model
# model_filename = '/home/anhkiet/Documents/Thuc_Tap/react-app2-fr-ba/api-model/model/tai_mlp_air_quality_model_optimized_3.joblib'
# best_model = joblib.load(model_filename)

# # Fetch air quality data from OpenWeather API
# def get_air_quality_data():
#     url = f'http://api.openweathermap.org/data/2.5/air_pollution?lat={LAT}&lon={LON}&appid={OPENWEATHER_API_KEY}'
#     response = requests.get(url)
#     return response.json()

# # Fetch 7 days of air quality data (6 days history + current day)
# def get_air_quality_data_7_days():
#     try:
#         current_data = get_air_quality_data()
#         if 'list' not in current_data:
#             print("API did not return prediction data.")
#             return None

#         # Get current day's components
#         current_components = current_data['list'][0]['components']
#         current_air_quality = [
#             current_components['pm2_5'],
#             current_components['pm10'],
#             current_components['co'],
#             current_components['so2']
#         ]

#         # List for last 6 days + current day
#         air_quality_7_days = [current_air_quality]
  
#         # Fetch the previous 6 days of air quality data from historical API
#         for i in range(6):
#             timestamp = int((pd.Timestamp.now() - pd.Timedelta(days=i + 1)).timestamp())
#             historical_url = f'http://api.openweathermap.org/data/2.5/air_pollution/history?lat={LAT}&lon={LON}&start={timestamp}&end={timestamp + 86400}&appid={OPENWEATHER_API_KEY}'
#             historical_response = requests.get(historical_url)

#             if historical_response.status_code == 200:
#                 historical_data = historical_response.json()
#                 if 'list' in historical_data:
#                     historical_components = historical_data['list'][0]['components']
#                     air_quality_7_days.append([
#                         historical_components['pm2_5'],
#                         historical_components['pm10'],
#                         historical_components['co'],
#                         historical_components['so2']
#                     ])
#                 else:
#                     print(f"No data found for day {i + 1}.")
#             else:
#                 print(f"HTTP error {historical_response.status_code} for day {i + 1}")

#         # Convert to DataFrame, reverse to order with oldest first
#         df_7_days = pd.DataFrame(air_quality_7_days[::-1], columns=['PM2.5', 'PM10', 'CO', 'SO2'])
#         return df_7_days
#     except Exception as e:
#         print(f"Error fetching data: {e}")
#         return None

# # Min-max scaling function


# def min_max_scaling(data, min_val=0, max_val=5):
#     min_data = data.min()
#     max_data = data.max()
    
#     # Kiểm tra nếu min_data và max_data bằng nhau
#     if min_data == max_data:
#         # Nếu tất cả giá trị giống nhau, trả về một series với giá trị min_val
#         return pd.Series(min_val, index=data.index)
    
#     # Chuẩn hóa dữ liệu giữa min_val và max_val
#     scaled_data = (data - min_data) / (max_data - min_data) * (max_val - min_val) + min_val
#     return scaled_data


# @app.route('/api/predict', methods=['GET'])
# def predict():
#     try:
#         # Fetch and prepare air quality data
#         df_forecast_7_days = get_air_quality_data_7_days()
#         if df_forecast_7_days is None or df_forecast_7_days.isnull().values.any():
#             return jsonify({'status': 'error', 'message': 'Unable to retrieve or prepare data'}), 500

#         # Normalize the data
#         X_forecast_scaled = df_forecast_7_days.apply(min_max_scaling)

#         # Generate predictions for the next 7 days
#         y_pred_7_days = best_model.predict(X_forecast_scaled)

#         # Create date labels for predictions
#         dates_7_days = [(datetime.now() + timedelta(days=i+1)).strftime('%Y-%m-%d') for i in range(7)]

#         # Send predictions in JSON format
#         return jsonify({
#             'status': 'success',
#             'dates': dates_7_days,
#             'predictions': y_pred_7_days.tolist()
#         })
#     except Exception as e:
#         return jsonify({'status': 'error', 'message': str(e)}), 500

# if __name__ == '__main__':
#     app.run(debug=True, port=5000)










from flask import Flask, jsonify
import requests
import pandas as pd
from datetime import datetime, timedelta
import numpy as np
import joblib

app = Flask(__name__)

# Đặt thông tin API
API_KEY = 'bb5bc6705ec5752cb4951b0774ffa9d2'
LATITUDE = 10.8231
LONGITUDE = 106.6297

def fetch_historical_data(start, end):
    url = f"http://api.openweathermap.org/data/2.5/air_pollution/history"
    params = {
        'lat': LATITUDE,
        'lon': LONGITUDE,
        'start': start,
        'end': end,
        'appid': API_KEY
    }
    response = requests.get(url, params=params)
    return response.json()

def get_time_range():
    now = datetime.utcnow()
    timestamps = []
    for i in range(5):  # 5 giờ trước
        start_time = now - timedelta(hours=i + 1)
        end_time = now - timedelta(hours=i)
        timestamps.append((int(start_time.timestamp()), int(end_time.timestamp())))
    return timestamps

@app.route('/api/predict', methods=['GET'])
def predict_aqi():
    # Lấy khoảng thời gian cho 5 giờ trước
    time_ranges = get_time_range()
    
    # Tạo DataFrame để lưu dữ liệu lịch sử
    historical_data = []
    
    for start, end in time_ranges:
        print(f"Fetching historical data for hour: start={start}, end={end}")
        historical_response = fetch_historical_data(start, end)
        print("Historical Response:", historical_response)
        
        # Kiểm tra nếu có dữ liệu trong phản hồi
        if 'list' in historical_response and historical_response['list']:
            for item in historical_response['list']:
                historical_data.append({
                    'timestamp': item['dt'],
                    'pm2_5': item['components']['pm2_5'],
                    'pm10': item['components']['pm10'],
                    'co': item['components']['co'],
                    'so2': item['components']['so2']
                })
        else:
            print(f"No data found for the range: {start} - {end}")
    
    # Tạo DataFrame từ dữ liệu lịch sử
    historical_df = pd.DataFrame(historical_data)
    
    # Kiểm tra DataFrame
    print("Historical DataFrame:", historical_df)
    
    # Kiểm tra và thêm các cột nếu thiếu
    for col in ['pm2_5', 'pm10', 'co', 'so2']:
        if col not in historical_df.columns:
            historical_df[col] = np.nan  # Thêm cột mới với giá trị NaN

    # Lấy dữ liệu chất lượng không khí hiện tại
    current_response = requests.get(f"http://api.openweathermap.org/data/2.5/air_pollution?lat={LATITUDE}&lon={LONGITUDE}&appid={API_KEY}")
    current_air_quality_data = current_response.json()
    print("Current Air Quality Data:", current_air_quality_data)
    
    # Thêm dữ liệu hiện tại vào DataFrame
    if 'list' in current_air_quality_data and current_air_quality_data['list']:
        current_components = current_air_quality_data['list'][0]['components']
        current_df = pd.DataFrame([{
            'timestamp': current_air_quality_data['list'][0]['dt'],
            'pm2_5': current_components['pm2_5'],
            'pm10': current_components['pm10'],
            'co': current_components['co'],
            'so2': current_components['so2']
        }])
    else:
        print("No current data found.")
        current_df = pd.DataFrame(columns=['timestamp', 'pm2_5', 'pm10', 'co', 'so2'])

    # Kiểm tra cấu trúc DataFrame hiện tại
    print("Current DataFrame:", current_df)

    # Kết hợp DataFrame lịch sử và hiện tại
    combined_df = pd.concat([historical_df, current_df], ignore_index=True)
    
    # Kiểm tra cột trong DataFrame
    print("Combined DataFrame columns:", combined_df.columns)

    # Kiểm tra cột có tồn tại không trước khi dự đoán
    for col in ['pm2_5', 'pm10', 'co', 'so2']:
        if col not in combined_df.columns:
            print(f"Column {col} is missing from Combined DataFrame")
            return jsonify({'error': f"Missing data for {col}"}), 500
    
    # Tải mô hình đã lưu
    model = joblib.load('your_model_path_here.pkl')

    # Dự đoán AQI
    try:
        predictions = model.predict(combined_df[['pm2_5', 'pm10', 'co', 'so2']])
        return jsonify({'predictions': predictions.tolist()}), 200
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)



