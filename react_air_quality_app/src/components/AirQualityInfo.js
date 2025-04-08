// my-react-app2/src/components/AirQualityInfo.js
import React from 'react';
import './AirQualityInfo.css';
import { useAirQuality } from '../services/AirQualityService';
import { useWeather } from '../services/WeatherService';

const AirQualityInfo = () => {
  const { airQualityData, loading: airLoading, error: airError } = useAirQuality();
  const { weatherData, loading: weatherLoading, error: weatherError } = useWeather();

  if (airLoading || weatherLoading) return <div>Loading...</div>;
  if (airError || weatherError) return <div>Error loading data</div>;
  if (!airQualityData || !weatherData) return null;

  const { main: { aqi }, components } = airQualityData.list[0];
  const { main: { temp }, wind: { speed }, main: { humidity } } = weatherData;

  const getAQIInfo = (aqi) => {
    switch (aqi) {
      case 1:
        return { 
          color: '#00E400', 
          label: 'Tốt',
          recommendation: 'Chất lượng không khí tốt, phù hợp cho các hoạt động ngoài trời'
        };
      case 2:
        return { 
          color: '#FFFF00', 
          label: 'Trung bình',
          recommendation: 'Người nhạy cảm nên hạn chế hoạt động ngoài trời kéo dài'
        };
      case 3:
        return { 
          color: '#FF7E00', 
          label: 'Không lành mạnh cho nhóm nhạy cảm',
          recommendation: 'Trẻ em, người già và người mắc bệnh hô hấp nên hạn chế ra ngoài'
        };
      case 4:
        return { 
          color: '#FF0000', 
          label: 'Không lành mạnh',
          recommendation: 'Mọi người nên hạn chế hoạt động ngoài trời, đeo khẩu trang khi ra ngoài'
        };
      case 5:
        return { 
          color: '#8F3F97', 
          label: 'Rất không lành mạnh',
          recommendation: 'Tránh các hoạt động ngoài trời, đóng cửa sổ và sử dụng máy lọc không khí'
        };
      default:
        return { 
          color: '#FFFF00', 
          label: 'Trung bình',
          recommendation: 'Người nhạy cảm nên hạn chế hoạt động ngoài trời kéo dài'
        };
    }
  };

  const { color, label } = getAQIInfo(aqi);

  const currentDate = new Date();
  const formattedTime = currentDate.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const formattedDay = currentDate.toLocaleDateString('vi-VN', { 
    weekday: 'short', 
    day: '2-digit' 
  });

  return (
    <div className="air-quality-container">
      <div className="left-section">
        <div className="navigation">
          World / <span>Việt Nam</span> / <span>Hồ Chí Minh</span>
        </div>
        <div className="text-content">
          <h1 className="title">Chất lượng không khí tại Ho Chi Minh City</h1>
          <p className="subtitle">
            Chỉ số chất lượng không khí (AQI*) và ô nhiễm không khí PM2.5 tại Ho Chi Minh City
          </p>
          <p className="timestamp">{formattedTime}, {formattedDay} Giờ địa phương</p>
        </div>
      </div>
      
      <div className="info-card">
        <div className="aqi-section" style={{ backgroundColor: `${color}20` }}>
          <div className="aqi-value">
            <span className="aqi-number">{aqi}</span>
            <span className="aqi-label">AQI</span>
          </div>
          <span className="aqi-status">{label}</span>
        </div>
        
        <div className="pollutant-section">
          <div className="pollutant-row">
            <span>Ô nhiễm chính: PM2.5</span>
            <span>{components.pm2_5.toFixed(1)} μg/m³</span>
          </div>
        </div>
        
        <div className="weather-section">
          <div className="weather-item">
            <span className="weather-icon">🌤️</span>
            <span>{Math.round(temp)}°</span>
          </div>
          <div className="weather-item">
            <span className="weather-icon">💨</span>
            <span>{(speed * 3.6).toFixed(1)} km/h</span>
          </div>
          <div className="weather-item">
            <span className="weather-icon">💧</span>
            <span>{humidity}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQualityInfo;  


