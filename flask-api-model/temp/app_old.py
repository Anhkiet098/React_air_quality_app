from flask import Flask, jsonify
from flask_cors import CORS
import numpy as np
import torch
import torch.nn as nn
import h5py
from sklearn.preprocessing import MinMaxScaler
import requests
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

OPENWEATHER_API_KEY = 'bb5bc6705ec5752cb4951b0774ffa9d2'
LAT = 10.8231
LON = 106.6297

class BiLSTMModel(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super(BiLSTMModel, self).__init__()
        self.hidden_size = hidden_size
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True, bidirectional=True)
        self.fc = nn.Linear(hidden_size * 2, output_size)

    def forward(self, x):
        h0 = torch.zeros(2, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(2, x.size(0), self.hidden_size).to(x.device)
        out, _ = self.lstm(x, (h0, c0))
        out = self.fc(out[:, -1, :])
        return out

def load_model_h5(model, path):
    with h5py.File(path, 'r') as h5file:
        model_state_dict = {}
        for key in h5file.keys():
            model_state_dict[key] = torch.tensor(np.array(h5file[key]))
    model.load_state_dict(model_state_dict)
    return model

def get_air_quality_data():
    url = f'http://api.openweathermap.org/data/2.5/air_pollution?lat={LAT}&lon={LON}&appid={OPENWEATHER_API_KEY}'
    response = requests.get(url)
    return response.json()

def prepare_input_sequence(air_data):
    # Lấy các thông số cần thiết từ API response
    components = air_data['list'][0]['components']
    
    # Tạo sequence với 7 features
    sequence = np.array([
        components['co'],
        components['no2'],
        components['o3'],
        components['so2'],
        components['pm2_5'],
        components['pm10'],
        air_data['list'][0]['main']['aqi']
    ]).reshape(1, -1)
    
    # Chuẩn hóa dữ liệu
    scaler = MinMaxScaler()
    scaled_sequence = scaler.fit_transform(sequence)
    
    # Chuyển đổi thành tensor
    return torch.tensor(scaled_sequence, dtype=torch.float32).unsqueeze(0), scaler

@app.route('/api/predict_hour', methods=['GET'])
def predict():
    try:
        # Lấy dữ liệu từ OpenWeather API
        air_data = get_air_quality_data()
        
        # Chuẩn bị dữ liệu đầu vào
        input_sequence, scaler = prepare_input_sequence(air_data)
        
        # Khởi tạo và load model
        input_size = 7
        hidden_size = 64
        output_size = 1
        model = BiLSTMModel(input_size, hidden_size, output_size)
        model = load_model_h5(model, 'model/biltsm_aqi_prediction_model.h5')
        model.eval()
        
        # Dự đoán cho 7 ngày tiếp theo
        days_to_predict = 7
        future_predictions = []
        dates = []
        
        for i in range(days_to_predict):
            with torch.no_grad():
                predicted_aqi = model(input_sequence)
                future_predictions.append(predicted_aqi.item())
                
                # Tạo ngày cho dự đoán
                current_date = (datetime.now() + timedelta(days=i)).strftime('%Y-%m-%d')
                dates.append(current_date)
                
                # Cập nhật sequence cho dự đoán tiếp theo
                new_sequence = input_sequence.squeeze(0).numpy()
                predicted_aqi_reshaped = predicted_aqi.numpy().reshape(1, -1)
                predicted_aqi_repeated = np.repeat(predicted_aqi_reshaped, new_sequence.shape[1], axis=1)
                new_sequence = np.vstack([new_sequence[1:], predicted_aqi_repeated])
                input_sequence = torch.tensor(new_sequence).unsqueeze(0)
        
        # Chuyển đổi về thang đo gốc 
        dummy_array = np.zeros((days_to_predict, input_size))
        dummy_array[:, -1] = future_predictions
        predictions_original = scaler.inverse_transform(dummy_array)[:, -1]
        
        return jsonify({
            'status': 'success',
            'dates': dates,
            'predictions': predictions_original.tolist()
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500




if __name__ == '__main__':
    app.run(debug=True, port=5000)




