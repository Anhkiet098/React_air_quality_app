import React from 'react';
import styled from 'styled-components';
import { WeatherProvider } from './services/WeatherService';
import { AirQualityProvider } from './services/AirQualityService';
import AirQualityInfo from './components/AirQualityInfo';
import AirQualityMap from './components/AirQualityMap';
import AQIPredictionChart from './components/AQIPredictionChart';
import HourlyAQIPrediction from './components/HourlyAQIPrediction';
import WeatherInfo from './components/WeatherInfo';
import AirPollutants from './components/AirPollutants';

const AppContainer = styled.div`
  width: 100%;
  font-family: 'Roboto', sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)),
    url('my-react-app2/wallpaper/pexels-benjaminlehman-1436129.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
`;

const Header = styled.header`
  background-color: #3498db;
  color: white;
  padding: 20px;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const MainContent = styled.main`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TopSection = styled.section`
  display: flex;
  justify-content: center;
  gap: 20px;
  width: 100%;
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

const WeatherSection = styled.div`
  display: flex;
  gap: 20px;
  width: 100%;
  margin-bottom: 20px;

  > div {
    width: 50%;  // Force equal width for both components
  }
`;

const WeatherInfoWrapper = styled.div`
  flex: 1;
`;

function App() {
  return (
    <AppContainer>
      <Header>
        <h1>Ho Chi Minh City Weather & Air Quality</h1>
      </Header>
      <MainContent>
        <TopSection>
          <WeatherProvider>
            <AirQualityProvider>
              <AirQualityInfo />
            </AirQualityProvider>
          </WeatherProvider>
        </TopSection>
        <WeatherSection>
          <WeatherProvider>
            <WeatherInfoWrapper>
              <WeatherInfo />
            </WeatherInfoWrapper>
          </WeatherProvider>
          <WeatherInfoWrapper>
            <AirQualityProvider>
              <AirPollutants />
            </AirQualityProvider>
          </WeatherInfoWrapper>
        </WeatherSection>
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




