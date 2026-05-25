import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import SpecPage from './SpecPage.jsx'
import './index.css'

function Root() {
  const [page, setPage] = useState('calculator');

  return (
    <>
      {/* Global nav */}
      <nav style={{
        position: 'fixed', top: 0, right: 0, zIndex: 1000,
        display: 'flex', gap: 4, padding: '8px 16px',
      }}>
        <NavBtn active={page === 'calculator'} onClick={() => setPage('calculator')}>
          Calculator
        </NavBtn>
        <NavBtn active={page === 'specs'} onClick={() => setPage('specs')}>
          Specialization
        </NavBtn>
      </nav>

      {page === 'calculator' ? <App /> : <SpecPage />}
    </>
  );
}

function NavBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? '#1e1400' : '#111118',
        border: `1px solid ${active ? '#f0a030' : '#2a2a3a'}`,
        color: active ? '#f0c060' : '#7070a0',
        borderRadius: 6, padding: '5px 14px', fontSize: 12,
        fontWeight: active ? 700 : 400, cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)