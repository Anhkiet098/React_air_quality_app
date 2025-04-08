// my-react-app2/src/components/AirQualityMap.js
import React from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
  overflow: 'hidden'
};

const AirQualityMap = () => {
  const lat = 10.8231;
  const lng = 106.6297;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  const [map, setMap] = React.useState(null);

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds({ lat, lng });
    map.fitBounds(bounds);

    const waqiMapOverlay = new window.google.maps.ImageMapType({
      getTileUrl: (coord, zoom) => {
        return `https://tiles.aqicn.org/tiles/usepa-aqi/${zoom}/${coord.x}/${coord.y}.png?token=${process.env.REACT_APP_WAQI_API_TOKEN}`;
      },
      name: "Air Quality",
    });

    map.overlayMapTypes.insertAt(0, waqiMapOverlay);

    setMap(map);
  }, [lat, lng]);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat, lng }}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
    />
  ) : <></>
};

export default AirQualityMap;