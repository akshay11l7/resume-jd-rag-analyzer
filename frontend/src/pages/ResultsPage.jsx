import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, MessageSquare, ChevronDown, ChevronUp, Send, Bot, Award, Briefcase, Zap, Loader2 } from 'lucide-react';

const CircularProgress = ({ value }) => {
  const [currentValue, setCurrentValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (start === end || isNaN(end)) return;
    let timer = setInterval(() => {
      start += 1;
      setCurrentValue(start);
      if (start === end) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [value]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentValue / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
        <circle 
          cx="80" cy="80" r={radius} 
          stroke="var(--border-color)" strokeWidth="12" fill="none" 
        />
        <circle 
          cx="80" cy="80" r={radius} 
          stroke="url(#gradient)" strokeWidth="12" fill="none" 
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--secondary-color)" />
            <stop offset="100%" stopColor="var(--accent-color)" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{currentValue}%</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ATS Score</div>
      </div>
    </div>
  );
};

const SkillChip = ({ skill, match }) => (
  <div style={{
    padding: '6px 12px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: '6px',
    backgroundColor: match ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    color: match ? 'var(--success-color)' : 'var(--error-color)',
    border: `1px solid ${match ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
  }}>
    {match ? <CheckCircle size={14} /> : <XCircle size={14} />}
    {skill}
  </div>
);

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
      <button 
        style={{ 
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '16px 0', background: 'none', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600 
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ overflow: 'hidden' }}>
          <div style={{ paddingBottom: '16px', color: 'var(--text-secondary)' }}>
            {children}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const ResultsPage = ({ results }) => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I've analyzed your resume. What would you like to know?" }
  ]);
  const [isChatting, setIsChatting] = useState(false);

  if (!results) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>No analysis data found.</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Please return to the dashboard and upload your documents.</p>
      </div>
    );
  }

  const { score, matched = [], missing = [], ai_analysis, session_id } = results;

  const handleChatSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!chatInput.trim() || !session_id) return;
    
    const userMsg = { role: 'user', content: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatting(true);

    try {
        const res = await fetch('http://localhost:8000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id, question: userMsg.content })
        });
        const data = await res.json();
        if (data.history) {
            setMessages([
              { role: 'assistant', content: "Hi! I've analyzed your resume. What would you like to know?" },
              ...data.history
            ]);
        }
    } catch(err) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Error communicating with AI." }]);
    } finally {
        setIsChatting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0 }}
      className="container" style={{ padding: '40px 24px', display: 'flex', gap: '32px', flexWrap: 'wrap' }}
    >
      {/* Main Results Column */}
      <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Header */}
        <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Analysis Results</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Your HireReady Score is in!</p>
          </div>
          <button className="btn btn-secondary"><Zap size={16} /> Export PDF</button>
        </motion.div>

        {/* ATS Score & Overview */}
        <motion.div variants={itemVariants} className="glass-card flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>ATS Compatibility</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {score >= 80 ? "Your resume is a strong match!" : "Your resume could use some improvements to pass ATS."}
            </p>
            <div className="flex gap-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-color)' }}>
                <CheckCircle size={18} /> {matched.length} Keywords matched
              </div>
              {missing.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning-color)' }}>
                  <AlertTriangle size={18} /> {missing.length} Keywords missing
                </div>
              )}
            </div>
          </div>
          <div style={{ paddingRight: '24px' }}>
            <CircularProgress value={score} />
          </div>
        </motion.div>

        {/* Skills Analysis */}
        <motion.div variants={itemVariants} className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="var(--secondary-color)" /> Skills Analysis
          </h2>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Matched Skills</h3>
            <div className="flex" style={{ gap: '8px', flexWrap: 'wrap' }}>
              {matched.length ? matched.map(s => <SkillChip key={s} skill={s} match={true} />) : <span style={{ color: 'var(--text-secondary)' }}>No skills matched.</span>}
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Missing Skills (Consider adding if applicable)</h3>
            <div className="flex" style={{ gap: '8px', flexWrap: 'wrap' }}>
              {missing.length ? missing.map(s => <SkillChip key={s} skill={s} match={false} />) : <span style={{ color: 'var(--text-secondary)' }}>No missing skills detected!</span>}
            </div>
          </div>
        </motion.div>

        {/* AI Suggestions */}
        <motion.div variants={itemVariants} className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={20} color="var(--accent-color)" /> AI Analysis & Suggestions
          </h2>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '12px', borderLeft: '4px solid var(--secondary-color)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {ai_analysis || "No AI analysis available."}
          </div>
        </motion.div>

      </div>

      {/* Right Column: AI Chat Panel */}
      <motion.div variants={itemVariants} style={{ flex: '0 1 350px', position: 'sticky', top: '100px', height: 'calc(100vh - 140px)' }}>
        <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--secondary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Bot size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>HireReady AI</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--success-color)' }}>Online</div>
            </div>
          </div>

          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', 
                maxWidth: '85%', 
                backgroundColor: msg.role === 'user' ? 'var(--accent-color)' : 'var(--bg-primary)', 
                color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                padding: '12px 16px', borderRadius: '16px', 
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px'
              }}>
                <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
              </div>
            ))}
            {isChatting && (
              <div style={{ alignSelf: 'flex-start' }}><Loader2 size={16} className="spin" style={{ color: 'var(--text-secondary)' }} /></div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask about your resume..." 
                style={{ 
                  width: '100%', padding: '12px 16px', paddingRight: '48px', 
                  borderRadius: '24px', border: '1px solid var(--border-color)', 
                  backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
                  outline: 'none', fontFamily: 'inherit'
                }} 
                disabled={isChatting}
              />
              <button 
                type="submit"
                disabled={isChatting}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={16} />
              </button>
            </div>
          </form>

        </div>
      </motion.div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
};

export default ResultsPage;
