import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 100%;
  overflow-y: auto;
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h2`
  color: #3498db;
  margin-bottom: 20px;
  font-size: 1.2em;
`;

const PredictionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PredictionItem = styled.div`
  padding: 12px 15px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-bottom: 1px solid #eee;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const DateTime = styled.span`
  font-size: 0.85em;
  color: #666;
`;

const AQIValue = styled.span`
  font-weight: bold;
  font-size: 0.95em;
  color: ${props => {
    const aqi = props.aqi;
    if (aqi <= 1) return '#4CAF50';      // Xanh lá
    if (aqi <= 2) return '#FFC107';      // Vàng
    if (aqi <= 3) return '#FF9800';      // Cam
    if (aqi <= 4) return '#F44336';      // Đỏ
    return '#9C27B0';                    // Tím
  }};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #ff0000;
`;

function HourlyAQIPrediction() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch('http://localhost:8000/predict_hourly', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received data:', data); // Thêm log để debug

        if (data.status === 'success') {
          setPredictions(data.data);
        } else {
          throw new Error(data.message || 'Không thể lấy dữ liệu dự đoán');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (loading) return <LoadingMessage>Đang tải dự đoán...</LoadingMessage>;
  if (error) return <ErrorMessage>Lỗi: {error}</ErrorMessage>;

  return (
    <Container>
      <Title>Dự đoán AQI theo giờ</Title>
      <PredictionList>
        {predictions.map((pred, index) => (
          <PredictionItem key={index} aqi={pred.aqi}>
            <DateTime>{new Date(pred.datetime).toLocaleString('vi-VN')}</DateTime>
            <AQIValue>AQI: {pred.aqi.toFixed(2)}</AQIValue>
          </PredictionItem>
        ))}
      </PredictionList>
    </Container>
  );
}

export default HourlyAQIPrediction;



