import React from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { ChartData } from '@/utils/dataUtils';

// 차트 색상 팔레트
const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff7f', 
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'
];

interface ChartRendererProps {
  chartData: ChartData;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ chartData }) => {
  const renderChart = (): React.ReactElement => {
    switch (chartData.type) {
      case 'bar':
        return (
          <BarChart data={chartData.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartData.xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={chartData.yKey} fill={CHART_COLORS[0]} />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={chartData.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartData.xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={chartData.yKey} 
              stroke={CHART_COLORS[0]} 
              strokeWidth={2}
            />
          </LineChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData.data}
              dataKey={chartData.yKey}
              nameKey={chartData.xKey}
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {chartData.data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      default:
        return <div>지원하지 않는 차트 타입입니다.</div>;
    }
  };

  return (
    <div className="w-full mb-8" data-testid="chart-renderer">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          📊 {chartData.title}
        </h3>
        <div className="text-sm text-text-muted">
          {chartData.type === 'bar' && '막대 차트'}
          {chartData.type === 'line' && '선 차트'}
          {chartData.type === 'pie' && '파이 차트'}
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 border" data-testid="chart-content">
        <ResponsiveContainer width="100%" height={500}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartRenderer;