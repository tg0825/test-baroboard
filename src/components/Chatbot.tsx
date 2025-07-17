"use client";

import React from 'react';

const Chatbot = () => {
  return (
    <div style={{ width: '300px', background: '#eaeaea', padding: '10px' }}>
      <h2>n8n Chatbot</h2>
      {/* n8n 임베드 챗봇을 iframe 등으로 여기에 삽입 */}
      <iframe src="https://example.com/n8n-chatbot" style={{ width: '100%', height: '100%' }} title="n8n Chatbot"></iframe>
    </div>
  );
};

export default Chatbot; 