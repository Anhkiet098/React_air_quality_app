// my-react-app2/src/services/WeatherService.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const WeatherContext = createContext();

const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
const LAT = 10.8231;
const LON = 106.6297;


export const WeatherProvider = ({ children }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`);
        setWeatherData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);  
      }
    };

    fetchWeatherData();
  }, []);

  return (
    <WeatherContext.Provider value={{ weatherData, loading, error }}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  return useContext(WeatherContext);
};


