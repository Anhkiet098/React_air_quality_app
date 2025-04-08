import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AirQualityContext = createContext();

const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
const LAT = 10.8231;
const LON = 106.6297;

export const AirQualityProvider = ({ children }) => {
  const [airQualityData, setAirQualityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAirQualityData = async () => {
      try {
        const response = await axios.get(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${LAT}&lon=${LON}&appid=${API_KEY}`);
        setAirQualityData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAirQualityData();
  }, []);

  return (
    <AirQualityContext.Provider value={{ airQualityData, loading, error }}>
      {children}
    </AirQualityContext.Provider>
  );
};

export const useAirQuality = () => {
  return useContext(AirQualityContext);
};
