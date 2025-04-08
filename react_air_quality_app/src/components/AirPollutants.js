import React from 'react';
import styled from 'styled-components';
import { useAirQuality } from '../services/AirQualityService';
import { WiDust } from 'react-icons/wi';

const PollutantsCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  min-height: 340px; // Match WeatherInfo height
`;

const Title = styled.h2`
  color: #3498db;
  margin-bottom: 20px;
  font-size: 1.2em;
`;

const PollutantsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`;

const PollutantItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 5px;
  height: 40px;
`;

const Icon = styled(WiDust)`
  color: #3498db;
  font-size: 1.5em;
  margin-right: 8px;
  flex-shrink: 0;
`;

const PollutantName = styled.span`
  color: #2c3e50;
  font-weight: 500;
  font-size: 1.1em;
  margin-right: 8px;
  flex-shrink: 0;
`;

const Value = styled.span`
  margin-left: auto;
  color: #2c3e50;
  font-weight: 500;
  font-size: 1.1em;
`;

const Unit = styled.span`
  color: #7f8c8d;
  font-size: 0.9em;
  margin-left: 4px;
  width: 45px;
  flex-shrink: 0;
`;

const AirPollutants = () => {
  const { airQualityData, loading, error } = useAirQuality();

  if (loading) return <PollutantsCard>Loading...</PollutantsCard>;
  if (error) return <PollutantsCard>Error: {error.message}</PollutantsCard>;
  if (!airQualityData) return null;

  const { components } = airQualityData.list[0];
  const pollutants = [
    { name: 'CO', value: components.co },
    { name: 'NO', value: components.no },
    { name: 'NO₂', value: components.no2 },
    { name: 'O₃', value: components.o3 },
    { name: 'SO₂', value: components.so2 },
    { name: 'PM2.5', value: components.pm2_5 },
    { name: 'PM10', value: components.pm10 },
    { name: 'NH₃', value: components.nh3 }
  ];

  return (
    <PollutantsCard>
      <Title>Chỉ số chất lượng không khí</Title>
      <PollutantsGrid>
        {pollutants.map((pollutant) => (
          <PollutantItem key={pollutant.name}>
            <Icon />
            <PollutantName>{pollutant.name}</PollutantName>
            <Value>{pollutant.value?.toFixed(1)}</Value>
            <Unit>μg/m³</Unit>
          </PollutantItem>
        ))}
      </PollutantsGrid>
    </PollutantsCard>
  );
};

export default AirPollutants;


