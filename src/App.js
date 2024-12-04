import React from 'react';
import styled from 'styled-components';
import WeatherInfo from './components/WeatherInfo';
import AirQualityInfo from './components/AirQualityInfo';
import AirQualityMap from './components/AirQualityMap';
import AQIPredictionChart from './components/AQIPredictionChart';
import HourlyAQIPrediction from './components/HourlyAQIPrediction';

const AppContainer = styled.div`
  font-family: 'Roboto', sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  background-color: #3498db;
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TopSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
`;

const PredictionSection = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: flex-start;
`;

const MapContainer = styled.div`
  width: 100%;
`;

function App() {
  return (
    <AppContainer>
      <Header>
        <h1>Ho Chi Minh City Weather & Air Quality</h1>
      </Header>
      <MainContent>
        <TopSection>
          <WeatherInfo />
          <AirQualityInfo />
        </TopSection>
        <PredictionSection>
          <AQIPredictionChart style={{ flex: 1 }} />
          <HourlyAQIPrediction style={{ width: '300px' }} />
        </PredictionSection>
        <MapContainer>
          <AirQualityMap />
        </MapContainer>
      </MainContent>
    </AppContainer>
  );
}

export default App;

