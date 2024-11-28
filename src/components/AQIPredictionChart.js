// my-react-app2/src/components/AQIPredictionChart.js

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const PredictionContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  grid-column: 1 / -1;
`;

const Title = styled.h2`
  color: #3498db;
  margin-bottom: 20px;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  text-align: center;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9em;
  margin-bottom: 5px;
`;

const StatValue = styled.div`
  color: #3498db;
  font-size: 1.2em;
  font-weight: bold;
`;

function AQIPredictionChart() {
  const [predictionData, setPredictionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    min: 0,
    max: 0,
    avg: 0,
    trend: ''
  });

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch('http://localhost:8000/predict_day', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors'  // Thêm dòng này
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
          const formattedData = data.data.map((item) => ({
            date: item.date,
            aqi: item.predicted_AQI,
            pm25: item.input_data?.['PM2.5'],
            pm10: item.input_data?.['PM10'],
            co: item.input_data?.['CO'],
            so2: item.input_data?.['SO2']
          }));

          // Tính toán thống kê
          const values = formattedData.map(d => d.aqi);
          const min = Math.min(...values);
          const max = Math.max(...values);
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          const trend = values[values.length - 1] > values[0] ? 'Tăng' : 'Giảm';

          setStats({
            min: min.toFixed(3),
            max: max.toFixed(3),
            avg: avg.toFixed(3),
            trend
          });
          
          setPredictionData(formattedData);
        } else {
          throw new Error(data.message || 'Không thể lấy dữ liệu dự đoán');
        }
      } catch (err) {
        console.error('Fetch error:', err);  // Thêm log chi tiết
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  const calculateYDomain = () => {
    if (predictionData.length === 0) return [0, 6];
    const values = predictionData.map(d => d.aqi);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.2; // Thêm 20% padding
    return [min - padding, max + padding];
  };

  if (loading) return <PredictionContainer>Loading predictions...</PredictionContainer>;
  if (error) return <PredictionContainer>Error: {error}</PredictionContainer>;

  return (
    <PredictionContainer>
      <Title>Dự đoán chỉ số AQI cho 7 ngày tiếp theo</Title>
      
      <StatsContainer>
        <StatCard>
          <StatLabel>Giá trị thấp nhất</StatLabel>
          <StatValue>{stats.min}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Giá trị cao nhất</StatLabel>
          <StatValue>{stats.max}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Giá trị trung bình</StatLabel>
          <StatValue>{stats.avg}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Xu hướng</StatLabel>
          <StatValue>{stats.trend}</StatValue>
        </StatCard>
      </StatsContainer>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={predictionData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            domain={calculateYDomain()}
            tickCount={10}
            tickFormatter={value => value.toFixed(3)}
          />
          <Tooltip
            formatter={(value) => [value.toFixed(3), 'AQI']}
            labelFormatter={(label) => `Ngày: ${label}`}
          />
          <Legend />
          <ReferenceLine
            y={stats.avg}
            stroke="#666"
            strokeDasharray="3 3"
            label={{ value: 'Trung bình', position: 'right' }}
          />
          <Line
            type="monotone"
            dataKey="aqi"
            name="Chỉ số AQI"
            stroke="#3498db"
            strokeWidth={2}
            dot={{
              fill: '#3498db',
              strokeWidth: 2,
              r: 6
            }}
            activeDot={{
              r: 8,
              stroke: '#3498db',
              strokeWidth: 2
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </PredictionContainer>
  );
}

export default AQIPredictionChart;
