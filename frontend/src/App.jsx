import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ResultsPage from './pages/ResultsPage';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [theme, setTheme] = useState('light');
  const [currentPage, setCurrentPage] = useState('landing'); // landing, dashboard, results
  const [pageData, setPageData] = useState(null);
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const navigate = (page, data = null) => {
    setCurrentPage(page);
    if (data) setPageData(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      <div className="bg-gradient-ai"></div>
      <Navbar theme={theme} toggleTheme={toggleTheme} navigate={navigate} currentPage={currentPage} />
      
      <main style={{ paddingTop: 'var(--navbar-height)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          {currentPage === 'landing' && <LandingPage key="landing" navigate={navigate} />}
          {currentPage === 'dashboard' && <Dashboard key="dashboard" navigate={navigate} />}
          {currentPage === 'results' && <ResultsPage key="results" navigate={navigate} results={pageData} />}
        </AnimatePresence>
      </main>
      
      <footer style={{
        marginTop: 'auto',
        padding: '32px 0',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        textAlign: 'center'
      }}>
        <div className="container flex flex-col items-center gap-4">
          <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>Hire<span className="text-gradient">Ready</span></div>
          <p style={{ maxWidth: '400px', fontSize: '0.9rem' }}>
            Get Your Resume. Job-Ready. AI-Ready. HireReady.
          </p>
          <div className="flex gap-4" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <a href="#" style={{ textDecoration: 'underline' }}>GitHub</a>
            <span>•</span>
            <span>Created by HireReady Team</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
