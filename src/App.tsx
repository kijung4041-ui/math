import React, { useState } from 'react';

export default function App() {
  const [solvedCount, setSolvedCount] = useState(0);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#38bdf8' }}>
        🔐 Math Escape: The Cipher Chamber
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '30px' }}>
        수학 방탈출 웹 앱에 오신 것을 환영합니다!
      </p>

      <div style={{
        backgroundColor: '#1e293b',
        padding: '20px 40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)',
        textAlign: 'center'
      }}>
        <h2>🔑 현재 수집한 열쇠 조각: {solvedCount} / 6</h2>
        <button 
          onClick={() => setSolvedCount(prev => Math.min(prev + 1, 6))}
          style={{
            marginTop: '15px',
            padding: '10px 20px',
            fontSize: '1rem',
            backgroundColor: '#0284c7',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          퍼즐 하나 해결 테스트
        </button>
      </div>
    </div>
  );
}