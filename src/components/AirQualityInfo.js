// my-react-app2/src/components/AirQualityInfo.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { WiDust } from 'react-icons/wi';

const API_KEY = 'bb5bc6705ec5752cb4951b0774ffa9d2';
const LAT = 10.8231;
const LON = 106.6297;

const AirQualityCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const AirQualityTitle = styled.h2`
  color: #3498db;
  margin-bottom: 20px;
`;

const AirQualityItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 1.1em;
`;

const AirQualityIcon = styled.span`
  margin-right: 10px;
  font-size: 1.5em;
  color: #3498db;
`;

const AQIIndicator = styled.div`
  display: inline-block;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
  color: white;
  background-color: ${props => {
    switch (props.aqi) {
      case 1: return '#00e400';
      case 2: return '#ffff00';
      case 3: return '#ff7e00';
      case 4: return '#ff0000';
      case 5: return '#8f3f97';
      default: return '#7e0023';
    }
  }};
`;

function AirQualityInfo() {
  const [airQualityData, setAirQualityData] = useState(null);

  useEffect(() => {
    const fetchAirQualityData = async () => {
      try {
        const response = await axios.get(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${LAT}&lon=${LON}&appid=${API_KEY}`);
        setAirQualityData(response.data);
      } catch (error) {
        console.error('Error fetching air quality data:', error);
      }
    };

    fetchAirQualityData();
  }, []);

  if (!airQualityData) return <AirQualityCard>Loading air quality data...</AirQualityCard>;

  const getAQIDescription = (aqi) => {
    const descriptions = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    return descriptions[aqi - 1] || 'Unknown';
  };

  const { list } = airQualityData;
  const { main, components } = list[0];

  return (
    <AirQualityCard>
      <AirQualityTitle>Air Quality in Ho Chi Minh City</AirQualityTitle>
      <AirQualityItem>
        <AirQualityIcon><WiDust /></AirQualityIcon>
        Air Quality Index: <AQIIndicator aqi={main.aqi}>{main.aqi} - {getAQIDescription(main.aqi)}</AQIIndicator>
      </AirQualityItem>
      <AirQualityItem>CO: {components.co.toFixed(2)} μg/m3</AirQualityItem>
      <AirQualityItem>NO: {components.no.toFixed(2)} μg/m3</AirQualityItem>
      <AirQualityItem>NO2: {components.no2.toFixed(2)} μg/m3</AirQualityItem>
      <AirQualityItem>O3: {components.o3.toFixed(2)} μg/m3</AirQualityItem>
      <AirQualityItem>SO2: {components.so2.toFixed(2)} μg/m3</AirQualityItem>
      <AirQualityItem>PM2.5: {components.pm2_5.toFixed(2)} μg/m3</AirQualityItem>
      <AirQualityItem>PM10: {components.pm10.toFixed(2)} μg/m3</AirQualityItem>
      <AirQualityItem>NH3: {components.nh3.toFixed(2)} μg/m3</AirQualityItem>
    </AirQualityCard>
  );
}

export default AirQualityInfo;