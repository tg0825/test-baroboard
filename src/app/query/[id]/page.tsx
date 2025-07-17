"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Dashboard from '@/components/Dashboard';

export default function QueryPage() {
  const params = useParams();
  const queryId = params.id as string;

  return (
    <div className="h-screen overflow-auto">
      <Dashboard initialQueryId={queryId ? parseInt(queryId) : null} />
    </div>
  );
} 