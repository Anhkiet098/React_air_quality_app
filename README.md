# Air Quality Monitoring System - Ho Chi Minh City

![React](https://img.shields.io/badge/React-18.3.1-blue)
![Flask](https://img.shields.io/badge/Flask-Latest-green)
![Python](https://img.shields.io/badge/Python-3.x-yellow)

## 📝 Mô tả

Hệ thống theo dõi và dự báo chất lượng không khí tại TP. Hồ Chí Minh, tích hợp dữ liệu thời tiết thời gian thực và khả năng dự báo AQI (Air Quality Index) sử dụng AI. Bao gồm Backend (flask-api) và Prontend (react-air-quality-app).

### ✨ Tính năng chính

- Hiển thị chỉ số chất lượng không khí (AQI) hiện tại
- Theo dõi các chất ô nhiễm chính (PM2.5, PM10, CO, SO2, etc.)
- Dự báo AQI cho 7 ngày tiếp theo
- Dự báo AQI theo giờ
- Hiển thị thông tin thời tiết hiện tại
- Bản đồ chất lượng không khí tương tác
- Giao diện người dùng trực quan và thân thiện

## 👨‍💻 Nhóm phát triển

Dự án được thực hiện bởi:

| Tên | GitHub | Vai trò |
|-----|--------|---------|
| 🌟 Châu Anh Kiệt (Me) | [@Anhkiet098](https://github.com/Anhkiet098) | Frontend & Backend & API Integration |
| 💡 Bùi Đức Tài | [@buiductai13](https://github.com/buiductai13) | AI Modeling MLP & Testing |
| 📊 Nguyễn Thị Mai Giang | [@Lucnee](https://github.com/Lucnee) | AI Modeling BiLTSM & Data Analysis |
| 📊 Từ Thanh Vy | [@TuThanhVy](https://github.com/TuThanhVy) | Collect & Data Processing |




## 🔧 Công nghệ sử dụng

### Frontend
- React 18.3.1
- Styled Components
- Recharts
- Google Maps API
- React Icons
- Axios

### Backend
- Flask
- TensorFlow/Keras
- Scikit-learn
- Pandas
- NumPy

### APIs
- OpenWeather API
- Google Maps API
- WAQI API

## 🚀 Cài đặt và Chạy

## 💻 Yêu cầu hệ thống

- Node.js >= 14
- Python >= 3.8
- pip, virtualenv

### Frontend

```bash
cd react_air_quality_app
npm install
npm start
```

### Backend

```bash
cd flask-api
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python app.py
```

## ⚙️ Cấu hình môi trường

### Frontend (.env)
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
REACT_APP_WAQI_API_TOKEN=your_waqi_token
REACT_APP_OPENWEATHER_API_KEY=your_openweather_key
```

### Backend (.env)
```
OPENWEATHER_API_KEY=your_openweather_key
```

## 📊 Cấu trúc dự án

```
my-react-app/
├── flask-api/               # Backend
|    ├── app.py              # Flask application
|    └── model/              # AI models
│
└── react_air_quality_app/    # Frontend
    ├── src/
    │   ├── components/       # React components
    │   ├── services/         # API services
    │   └── App.js           # Main application
    └── package.json
```

## 🖼️ Screenshots

![Screenshot from 2025-04-08 11-45-57](https://github.com/user-attachments/assets/c6f22c13-bf33-40b6-a02a-9186b524c118)
![Screenshot from 2025-04-08 11-46-28](https://github.com/user-attachments/assets/66327b15-323a-4a27-89b0-acb0598f8945)

## 🔮 AI Models

Dự án sử dụng hai mô hình AI chính:

### 1. MLP (Multi-Layer Perceptron) cho dự báo AQI theo ngày

**Input:**
- Dữ liệu 7 ngày gần nhất với 4 thông số:
  - PM2.5 (μg/m³)
  - PM10 (μg/m³)
  - CO (mg/m³)
  - SO2 (μg/m³)

**Tiền xử lý:**
- Chuẩn hóa dữ liệu sử dụng Min-Max scaling (0-1)
- Xử lý missing values bằng mean imputation

**Output:**
- Dự báo chỉ số AQI cho 7 ngày tiếp theo
- Giá trị AQI được giới hạn trong khoảng 0-5
- Kết quả trả về dưới dạng JSON với format:
  ```json
  {
    "date": "YYYY-MM-DD",
    "predicted_AQI": float
  }
  ```

### 2. BiLSTM (Bidirectional Long Short-Term Memory) cho dự báo AQI theo giờ

**Input:**
- Chuỗi thời gian 48 giờ gần nhất với 5 thông số:
  - PM2.5 (μg/m³)
  - PM10 (μg/m³)
  - CO (mg/m³)
  - SO2 (μg/m³)
  - AQI hiện tại

**Tiền xử lý:**
- Chuẩn hóa dữ liệu sử dụng StandardScaler
- Window size: 48 giờ
- Forward filling cho missing values

**Output:**
- Dự báo chỉ số AQI cho 7 giờ tiếp theo
- Kết quả được làm mượt bằng rolling mean (window=3)
- Kết quả trả về dưới dạng JSON với format:
  ```json
  {
    "datetime": "YYYY-MM-DD HH:MM:SS",
    "timezone": "Asia/Ho_Chi_Minh",
    "aqi": float
  }
  ```

### Lưu ý:
- Cả hai mô hình đều được lưu trữ trong thư mục `model/`
- MLP model: `tai_theo_ngay_25_11_mlp_air_quality_model_daily.joblib`
- BiLSTM model: `maigiang_25_11_theo_gio_bilstm_aqi_model.keras`
- Dữ liệu thời gian thực được lấy từ OpenWeather API
- Timezone được chuẩn hóa theo múi giờ Việt Nam (UTC+7)

## 👥 Đóng góp

Đóng góp luôn được chào đón! Vui lòng:
1. Fork dự án
2. Tạo nhánh tính năng (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên nhánh (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📝 License

MIT License

## 📧 Liên hệ

Email: chauanhkiet2906@gmail.com

---

⭐️ Nếu bạn thấy dự án này hữu ích, hãy cho chúng tôi một ngôi sao trên GitHub!
