// my-react-app2/src/components/WeatherInfo.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { WiThermometer, WiHumidity, WiStrongWind, WiRainMix } from 'react-icons/wi';

const API_KEY = 'bb5bc6705ec5752cb4951b0774ffa9d2';
const LAT = 10.8231;
const LON = 106.6297;

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

function WeatherInfo() {
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`);
        setWeatherData(response.data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeatherData();
  }, []);

  if (!weatherData) return <WeatherCard>Loading weather data...</WeatherCard>;

  return (
    <WeatherCard>
      <WeatherTitle>Current Weather in Ho Chi Minh City</WeatherTitle>
      <WeatherItem>
        <WeatherIcon><WiThermometer /></WeatherIcon>
        Temperature: {weatherData.main.temp.toFixed(1)}°C
      </WeatherItem>
      <WeatherItem>
        <WeatherIcon><WiThermometer /></WeatherIcon>
        Feels like: {weatherData.main.feels_like.toFixed(1)}°C
      </WeatherItem>
      <WeatherItem>
        <WeatherIcon><WiHumidity /></WeatherIcon>
        Humidity: {weatherData.main.humidity}%
      </WeatherItem>
      <WeatherItem>
        <WeatherIcon><WiStrongWind /></WeatherIcon>
        Wind Speed: {weatherData.wind.speed.toFixed(1)} m/s
      </WeatherItem>
      <WeatherItem>
        <WeatherIcon><WiRainMix /></WeatherIcon>
        Weather: {weatherData.weather[0].description}
      </WeatherItem>
    </WeatherCard>
  );
}

export default WeatherInfo;