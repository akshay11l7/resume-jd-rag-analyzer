import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, Briefcase, ChevronRight, Settings, MessageSquare, Mic, LayoutDashboard, History, Loader2, Zap } from 'lucide-react';

const SidebarItem = ({ icon, label, active }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px',
    backgroundColor: active ? 'var(--bg-primary)' : 'transparent',
    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
    fontWeight: active ? 600 : 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: active ? '1px solid var(--border-color)' : '1px solid transparent'
  }} className={!active ? "hover-bg" : ""}>
    {icon}
    <span>{label}</span>
    {active && <ChevronRight size={16} style={{ marginLeft: 'auto', color: 'var(--accent-color)' }} />}
    <style>{`
      .hover-bg:hover { background-color: var(--bg-primary); color: var(--text-primary); }
    `}</style>
  </div>
);

const UploadCard = ({ title, icon, color, file, onFileChange }) => (
  <div className="glass-card" style={{ 
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '48px 24px', borderStyle: 'dashed', borderWidth: '2px', borderColor: file ? color : 'var(--border-color)',
    cursor: 'pointer', position: 'relative', overflow: 'hidden', textAlign: 'center', minHeight: '260px'
  }}>
    <input 
      type="file" 
      accept=".pdf,.docx" 
      onChange={(e) => onFileChange(e.target.files[0])}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
    />
    <div style={{ 
      width: '64px', height: '64px', borderRadius: '50%', backgroundColor: `${color}15`, color: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px'
    }}>
      {icon}
    </div>
    <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{title}</h3>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
      {file ? file.name : "Drag & drop your file here, or click to browse"}
    </p>
    {!file && (
      <div style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
        Supports PDF, DOCX (Max 5MB)
      </div>
    )}
  </div>
);

const Dashboard = ({ navigate }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [jdInputType, setJdInputType] = useState('file'); // 'file' or 'text'
  const [jdText, setJdText] = useState('');

  const handleAnalyze = async () => {
    if (!resumeFile) {
        alert("Please upload your Resume.");
        return;
    }
    if (jdInputType === 'file' && !jdFile) {
        alert("Please upload the Job Description file.");
        return;
    }
    if (jdInputType === 'text' && !jdText.trim()) {
        alert("Please paste the Job Description text.");
        return;
    }

    setAnalyzing(true);
    const formData = new FormData();
    formData.append('resume', resumeFile);
    if (jdInputType === 'file') {
        formData.append('jd', jdFile);
    } else {
        formData.append('jd_text', jdText);
    }

    try {
        const res = await fetch('http://localhost:8000/api/analyze', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        setAnalyzing(false);
        if (data.error) {
            alert(data.error);
        } else {
            navigate('results', data);
        }
    } catch (err) {
        console.error(err);
        setAnalyzing(false);
        alert("Error connecting to the backend. Is it running?");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      style={{ display: 'flex', flex: 1, backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Sidebar */}
      <aside style={{ 
        width: '260px', backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)',
        padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px'
      }} className="hidden-mobile">
        <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
        <SidebarItem icon={<UploadCloud size={20} />} label="Upload Documents" />
        <SidebarItem icon={<History size={20} />} label="Analysis History" />
        <SidebarItem icon={<MessageSquare size={20} />} label="Resume Chat" />
        <SidebarItem icon={<Mic size={20} />} label="Interview Questions" />
        <div style={{ flex: 1 }} />
        <SidebarItem icon={<Settings size={20} />} label="Settings" />
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <motion.div 
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            style={{ marginBottom: '40px' }}
          >
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome back! Let's get you <span className="text-gradient">HireReady.</span></h1>
            <p style={{ color: 'var(--text-secondary)' }}>Upload your latest resume and the job description to start the analysis.</p>
          </motion.div>

          <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', flexWrap: 'wrap', alignItems: 'stretch' }}>
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '40px', marginBottom: '16px' }} /> {/* Spacer to align with JD toggle */}
              <UploadCard 
                title="Upload Resume" 
                icon={<FileText size={32} />} 
                color="var(--secondary-color)" 
                file={resumeFile}
                onFileChange={setResumeFile}
              />
            </motion.div>
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', height: '40px' }}>
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', padding: '4px', border: '1px solid var(--border-color)' }}>
                  <button 
                    onClick={() => setJdInputType('file')}
                    style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: jdInputType === 'file' ? 600 : 500, backgroundColor: jdInputType === 'file' ? 'var(--bg-secondary)' : 'transparent', color: jdInputType === 'file' ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: jdInputType === 'file' ? 'var(--card-shadow)' : 'none', transition: 'all 0.2s' }}
                  >Upload File</button>
                  <button 
                    onClick={() => setJdInputType('text')}
                    style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: jdInputType === 'text' ? 600 : 500, backgroundColor: jdInputType === 'text' ? 'var(--bg-secondary)' : 'transparent', color: jdInputType === 'text' ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: jdInputType === 'text' ? 'var(--card-shadow)' : 'none', transition: 'all 0.2s' }}
                  >Paste Text</button>
                </div>
              </div>
              
              {jdInputType === 'file' ? (
                  <UploadCard 
                    title="Upload Job Description" 
                    icon={<Briefcase size={32} />} 
                    color="var(--accent-color)" 
                    file={jdFile}
                    onFileChange={setJdFile}
                  />
              ) : (
                  <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', minHeight: '260px' }}>
                      <textarea 
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder="Paste the job description here..."
                        style={{ 
                          flex: 1, width: '100%', minHeight: '200px', resize: 'none', border: '1px solid var(--border-color)', 
                          borderRadius: '8px', padding: '16px', backgroundColor: 'var(--bg-primary)', 
                          color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none'
                        }}
                      />
                  </div>
              )}
            </motion.div>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <button 
              className="btn btn-primary" 
              onClick={handleAnalyze}
              disabled={analyzing}
              style={{ 
                padding: '16px 48px', fontSize: '1.25rem', borderRadius: '12px',
                width: '100%', maxWidth: '400px', height: '64px',
                position: 'relative', overflow: 'hidden'
              }}
            >
              {analyzing ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Loader2 size={24} className="spin" />
                  Analyzing Documents...
                </motion.div>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Zap size={24} /> Run AI Analysis
                </span>
              )}
            </button>
          </motion.div>

        </div>
      </main>
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
};

export default Dashboard;
