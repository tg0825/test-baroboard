"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Container from './Container';

interface DashboardProps {
  initialQueryId?: number | null;
}

const Dashboard = ({ initialQueryId }: DashboardProps) => {
  const [selectedData, setSelectedData] = useState<{ [key: string]: unknown } | null>(null);

  const handleQuerySelect = (data: { [key: string]: unknown }) => {
    setSelectedData(data);
  };

  // 초기 쿼리 ID가 있을 때 자동으로 해당 쿼리를 선택
  useEffect(() => {
    if (initialQueryId && initialQueryId > 0 && initialQueryId <= 100) {
      // 배달대행사 관련 쿼리 데이터 (Sidebar와 동일한 로직)
      const deliveryQueries = [
        "배달 기사별 일일 주문 완료율 분석",
        "시간대별 배달 주문량 추이 리포트",
        "음식점 카테고리별 주문 현황 대시보드",
        "배달 지연 원인 분석 및 개선방안",
        "고객 만족도 점수별 주문 분포",
        "배달 거리별 평균 소요시간 분석",
        "요일별 주문량 변화 트렌드",
        "우천시 배달 성과 영향 분석",
        "프로모션 이벤트 효과 측정 리포트",
        "배달 기사 근무시간 최적화 분석",
        "주문 취소율 감소 전략 리포트",
        "신규 고객 유입 경로 분석",
        "재주문률 향상 방안 연구",
        "배달료 정책 변경 영향 분석",
        "앱 사용자 행동 패턴 분석",
        "주요 경쟁사 대비 배달시간 비교",
        "지역별 배달 수요 예측 모델",
        "배달 기사 교육 효과 측정",
        "고객 리뷰 감정 분석 리포트",
        "메뉴 인기도별 주문 패턴 분석",
        "배달팁 금액별 주문 완료율",
        "월별 매출 성장률 추이 분석",
        "배달 앱 다운로드 수 증가율",
        "고객 연령대별 주문 선호도",
        "배달 포장 품질 만족도 조사",
        "실시간 배달 현황 모니터링",
        "주문 집중 시간대 배치 최적화",
        "신메뉴 출시 효과 분석 리포트",
        "배달 사고 발생률 감소 전략",
        "고객 대기시간 단축 방안 연구"
      ];

      const queryIndex = (initialQueryId - 1) % deliveryQueries.length;
      const queryNumber = Math.floor((initialQueryId - 1) / deliveryQueries.length) + 1;
      
      const queryName = queryNumber > 1 ? `${deliveryQueries[queryIndex]} (${queryNumber}차)` : deliveryQueries[queryIndex];
      
      const data = {
        query: queryName,
        id: initialQueryId,
        type: (initialQueryId - 1) % 3 === 0 ? '분석' : (initialQueryId - 1) % 3 === 1 ? '보고서' : '대시보드',
        description: `배달대행사 운영 최적화를 위한 데이터 분석 쿼리 ${initialQueryId}`,
        result: Math.random() * 100,
        timestamp: new Date().toISOString()
      };
      
      setSelectedData(data);
    }
  }, [initialQueryId]);

  return (
    <div className="flex h-full relative">
      <Sidebar onQuerySelect={handleQuerySelect} />
      <Container selectedData={selectedData} />
    </div>
  );
};

export default Dashboard; 