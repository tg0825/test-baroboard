"use client";

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Container from './Container';

const Dashboard = () => {
  const [selectedData, setSelectedData] = useState<{ [key: string]: unknown } | null>(null);

  const handleQuerySelect = (data: { [key: string]: unknown }) => {
    setSelectedData(data);
  };

  return (
    <div className="flex h-full relative">
      <Sidebar onQuerySelect={handleQuerySelect} />
      <Container selectedData={selectedData} />
    </div>
  );
};

export default Dashboard; 