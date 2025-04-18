// my-react-app2/src/components/WeatherInfo.js

import React from 'react';
import styled from 'styled-components';
import { WiThermometer, WiHumidity, WiStrongWind, WiRainMix } from 'react-icons/wi';
import { useWeather } from '../services/WeatherService';

const WeatherCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const WeatherTitle = styled.h2`
  color: #3498db;
  margin-bottom: 20px;
`;

const WeatherItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 1.1em;
`;

const WeatherIcon = styled.span`
  margin-right: 10px;
  font-size: 1.5em;
  color: #3498db;
`;

const WeatherInfo = () => {
  const { weatherData, loading, error } = useWeather();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!weatherData) return null;

  return (
    <WeatherCard>
      <WeatherTitle>Thời tiết hiện tại tại TP. Hồ Chí Minh</WeatherTitle>
      <WeatherItem>
        <WeatherIcon><WiThermometer /></WeatherIcon>
        Nhiệt độ: {weatherData.main.temp.toFixed(1)}°C
      </WeatherItem>
      <WeatherItem>
        <WeatherIcon><WiThermometer /></WeatherIcon>
        Cảm giác như: {weatherData.main.feels_like.toFixed(1)}°C
      </WeatherItem>
      <WeatherItem>
        <WeatherIcon><WiHumidity /></WeatherIcon>
        Độ ẩm: {weatherData.main.humidity}%
      </WeatherItem>
      <WeatherItem>
        <WeatherIcon><WiStrongWind /></WeatherIcon>
        Tốc độ gió: {weatherData.wind.speed.toFixed(1)} m/s
      </WeatherItem>
      <WeatherItem>
        <WeatherIcon><WiRainMix /></WeatherIcon>
        Thời tiết: {weatherData.weather[0].description}
      </WeatherItem>
    </WeatherCard>
  );
}

export default WeatherInfo;






