import React from 'react';
import styled from 'styled-components';
import WeatherInfo from './components/WeatherInfo';
import AirQualityInfo from './components/AirQualityInfo';
import AirQualityMap from './components/AirQualityMap';
import AQIPredictionChart from './components/AQIPredictionChart';

const AppContainer = styled.div`
  font-family: 'Roboto', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MapContainer = styled.div`
  grid-column: 1 / -1;
  margin-top: 20px;
`;

function App() {
  return (
    <AppContainer>
      <Header>
        <h1>Ho Chi Minh City Weather & Air Quality</h1>
      </Header>
      <MainContent>
        <WeatherInfo />
        <AirQualityInfo />
        <AQIPredictionChart />
      </MainContent>
      <MapContainer>
        <AirQualityMap />
      </MapContainer>
    </AppContainer>
  );
}

export default App;