"use client";

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Graph = ({ data }: { data: { [key: string]: unknown } }) => {
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case '분석': return 'bg-primary-main text-primary-main border-border-primary bg-primary-pale';
      case '보고서': return 'bg-success-main text-success-main border-border-light bg-success-pale';
      case '대시보드': return 'bg-warning-main text-warning-main border-border-light bg-warning-pale';
      default: return 'bg-secondary-main text-secondary-main border-border-light bg-secondary-pale';
    }
  };

  // 차트 데이터 생성 - 실제 데이터로 변경 필요
  const generateChartData = () => {
    // TODO: 실제 API 데이터를 기반으로 차트 데이터 생성
    // 현재는 빈 데이터 구조만 제공
    return {
      lineData: {
        labels: [],
        datasets: [
          {
            label: '데이터 없음',
            data: [],
            borderColor: '#fa5014',
            backgroundColor: 'rgba(250, 80, 20, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      barData: {
        labels: [],
        datasets: [
          {
            label: '데이터 없음',
            data: [],
            backgroundColor: 'rgba(250, 80, 20, 0.6)',
            borderColor: '#fa5014',
            borderWidth: 1,
          },
        ],
      },
      doughnutData: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
    };
  };

  const chartData = generateChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: isMobile ? 10 : 12,
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12,
          },
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12,
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            size: isMobile ? 10 : 12,
          },
        },
      },
    },
  };

  // 차트 패턴을 결정하는 함수
  const getChartPattern = () => {
    const queryId = data.id as number;
    
    // 쿼리 ID를 기준으로 다른 패턴 결정
    const patternIndex = queryId % 5;
    
    switch (patternIndex) {
      case 0: // 도넛 차트만
        return 'doughnut-only';
      case 1: // 라인 차트만
        return 'line-only';
      case 2: // 바 차트만
        return 'bar-only';
      case 3: // 라인 + 도넛
        return 'line-doughnut';
      case 4: // 모든 차트
        return 'all-charts';
      default:
        return 'all-charts';
    }
  };

  const chartPattern = getChartPattern();

  // 패턴별 차트 렌더링 함수
  const renderCharts = () => {
    switch (chartPattern) {
      case 'doughnut-only':
        return (
          <div className="grid gap-6 grid-cols-1">
            <div className="bg-background-main border border-border-light rounded-lg p-4">
              <h4 className={`
                ${isMobile ? 'text-sm' : 'text-base'} 
                font-semibold text-text-primary mb-4 text-center
              `}>
                주문 상태별 분포 분석
              </h4>
              <div className={`${isMobile ? 'h-[300px]' : 'h-[400px]'} flex justify-center`}>
                <div className="w-full max-w-[500px]">
                  <Doughnut data={chartData.doughnutData} options={doughnutOptions} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'line-only':
        return (
          <div className="grid gap-6 grid-cols-1">
            <div className="bg-background-main border border-border-light rounded-lg p-4">
              <h4 className={`
                ${isMobile ? 'text-sm' : 'text-base'} 
                font-semibold text-text-primary mb-4 text-center
              `}>
                시간대별 주문량 트렌드 분석
              </h4>
              <div className={`${isMobile ? 'h-[250px]' : 'h-[350px]'}`}>
                <Line data={chartData.lineData} options={chartOptions} />
              </div>
            </div>
          </div>
        );

      case 'bar-only':
        return (
          <div className="grid gap-6 grid-cols-1">
            <div className="bg-background-main border border-border-light rounded-lg p-4">
              <h4 className={`
                ${isMobile ? 'text-sm' : 'text-base'} 
                font-semibold text-text-primary mb-4 text-center
              `}>
                배달시간 성과 분석
              </h4>
              <div className={`${isMobile ? 'h-[250px]' : 'h-[350px]'}`}>
                <Bar data={chartData.barData} options={chartOptions} />
              </div>
            </div>
          </div>
        );

      case 'line-doughnut':
        return (
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className="bg-background-main border border-border-light rounded-lg p-4">
              <h4 className={`
                ${isMobile ? 'text-sm' : 'text-base'} 
                font-semibold text-text-primary mb-4 text-center
              `}>
                주문량 추이
              </h4>
              <div className={`${isMobile ? 'h-[200px]' : 'h-[250px]'}`}>
                <Line data={chartData.lineData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-background-main border border-border-light rounded-lg p-4">
              <h4 className={`
                ${isMobile ? 'text-sm' : 'text-base'} 
                font-semibold text-text-primary mb-4 text-center
              `}>
                주문 상태 분포
              </h4>
              <div className={`${isMobile ? 'h-[200px]' : 'h-[250px]'} flex justify-center`}>
                <div className="w-full max-w-[300px]">
                  <Doughnut data={chartData.doughnutData} options={doughnutOptions} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'all-charts':
      default:
        return (
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className="bg-background-main border border-border-light rounded-lg p-4">
              <h4 className={`
                ${isMobile ? 'text-sm' : 'text-base'} 
                font-semibold text-text-primary mb-4 text-center
              `}>
                시간대별 주문량 추이
              </h4>
              <div className={`${isMobile ? 'h-[200px]' : 'h-[250px]'}`}>
                <Line data={chartData.lineData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-background-main border border-border-light rounded-lg p-4">
              <h4 className={`
                ${isMobile ? 'text-sm' : 'text-base'} 
                font-semibold text-text-primary mb-4 text-center
              `}>
                시간대별 평균 배달시간
              </h4>
              <div className={`${isMobile ? 'h-[200px]' : 'h-[250px]'}`}>
                <Bar data={chartData.barData} options={chartOptions} />
              </div>
            </div>

            <div className={`bg-background-main border border-border-light rounded-lg p-4 ${isMobile ? '' : 'col-span-2'}`}>
              <h4 className={`
                ${isMobile ? 'text-sm' : 'text-base'} 
                font-semibold text-text-primary mb-4 text-center
              `}>
                주문 상태별 분포
              </h4>
              <div className={`${isMobile ? 'h-[200px]' : 'h-[300px]'} flex justify-center`}>
                <div className="w-full max-w-[400px]">
                  <Doughnut data={chartData.doughnutData} options={doughnutOptions} />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`
      flex-1 
      ${isMobile ? 'p-3' : 'p-6'} 
      h-full
      overflow-y-auto
    `}>
      <div className={`flex items-center gap-3 ${isMobile ? 'mb-5' : 'mb-6'}`}>
        <div className={`w-2 h-8 ${getTypeStyles(data.type as string).split(' ')[0]} rounded`}></div>
        <h2 className={`
          ${isMobile ? 'text-xl' : 'text-2xl'} 
          m-0 text-text-primary font-bold
        `}>
          쿼리 결과
        </h2>
      </div>
      
      {/* 쿼리 정보 카드 */}
      <div className={`
        card
        ${isMobile ? 'p-5' : 'p-6'} 
        ${isMobile ? 'mb-4' : 'mb-5'}
      `}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📊</span>
          <h3 className={`
            ${isMobile ? 'text-base' : 'text-lg'} 
            m-0 text-text-primary font-semibold
          `}>
            쿼리 정보
          </h3>
        </div>
        
        <div className="grid gap-3">
          <div className={`
            p-3 rounded-lg border
            ${getTypeStyles(data.type as string).split(' ')[3]}
            ${getTypeStyles(data.type as string).split(' ')[2]}
          `}>
            <div className={`
              ${isMobile ? 'text-xs' : 'text-sm'} 
              ${getTypeStyles(data.type as string).split(' ')[1]}
              font-semibold mb-1
            `}>
              쿼리명
            </div>
            <div className={`
              ${isMobile ? 'text-sm' : 'text-base'} 
              text-text-primary break-words leading-relaxed
            `}>
              {data.query as string}
            </div>
          </div>
          
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
            <div className="p-3 bg-secondary-pale rounded-lg border border-border-light">
              <div className={`
                ${isMobile ? 'text-xs' : 'text-sm'} 
                text-text-secondary font-semibold mb-1
              `}>
                타입
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${getTypeStyles(data.type as string).split(' ')[0]}`}></span>
                <span className={`
                  ${isMobile ? 'text-sm' : 'text-base'} 
                  ${getTypeStyles(data.type as string).split(' ')[1]}
                  font-semibold
                `}>
                  {data.type as string}
                </span>
              </div>
            </div>
            
            <div className="p-3 bg-info-pale rounded-lg border border-border-light">
              <div className={`
                ${isMobile ? 'text-xs' : 'text-sm'} 
                text-info-main font-semibold mb-1
              `}>
                ID
              </div>
              <div className={`
                ${isMobile ? 'text-sm' : 'text-base'} 
                text-text-primary font-semibold
              `}>
                #{data.id as number}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 상세 데이터 */}
      <div className={`card ${isMobile ? 'p-5' : 'p-6'}`}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🔍</span>
          <h3 className={`
            ${isMobile ? 'text-base' : 'text-lg'} 
            m-0 text-text-primary font-semibold
          `}>
            상세 데이터
          </h3>
        </div>
        
        <pre className={`
          ${isMobile ? 'text-xs' : 'text-sm'} 
          bg-secondary-pale 
          ${isMobile ? 'p-4' : 'p-5'} 
          rounded-lg overflow-auto
          ${isMobile ? 'max-h-[300px]' : 'max-h-[400px]'}
          font-mono leading-relaxed border border-border-light
          text-text-primary m-0
        `}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Graph; 