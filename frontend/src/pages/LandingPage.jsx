import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Play, FileText, Target, Zap, Cpu, MessageSquare, Mic } from 'lucide-react';

const features = [
  { icon: <FileText size={24} />, title: 'Resume Analysis', desc: 'Deep dive into your professional experience with AI.' },
  { icon: <Target size={24} />, title: 'ATS Score Prediction', desc: 'Know your compatibility before applying.' },
  { icon: <Zap size={24} />, title: 'Skill Gap Detection', desc: 'Identify exactly what you need to learn.' },
  { icon: <Cpu size={24} />, title: 'AI Suggestions', desc: 'Get actionable tips to improve your bullet points.' },
  { icon: <MessageSquare size={24} />, title: 'Chat with Resume', desc: 'Ask our AI any question about your profile.' },
  { icon: <Mic size={24} />, title: 'Interview Prep', desc: 'Practice with tailored behavioral & technical questions.' }
];

const LandingPage = ({ navigate }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      {/* Hero Section */}
      <section style={{ 
        padding: '120px 0 80px', 
        textAlign: 'center', 
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.6 }}
          className="container"
        >
          <div style={{ 
            display: 'inline-block', padding: '6px 16px', borderRadius: '999px',
            backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)',
            fontSize: '0.85rem', fontWeight: 600, marginBottom: '24px'
          }}>
            ✨ HireReady AI 2.0 is now live
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', 
            fontWeight: 800, 
            letterSpacing: '-1.5px',
            maxWidth: '900px',
            margin: '0 auto 24px'
          }}>
            AI-Powered <span className="text-gradient">Resume & Job Description</span> Analyzer
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(1rem, 2vw, 1.25rem)', 
            color: 'var(--text-secondary)',
            maxWidth: '700px',
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            HireReady uses Retrieval-Augmented Generation (RAG) and AI to analyze your resume, estimate ATS compatibility, identify missing skills, and prepare you for your next interview.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.1rem' }} onClick={() => navigate('dashboard')}>
              <Upload size={20} /> Upload Resume
            </button>
            <button className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1.1rem' }} onClick={() => navigate('dashboard')}>
              <Play size={20} /> Try Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Everything you need to get <span className="text-gradient">Hired</span></h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Our comprehensive suite of AI tools ensures your profile stands out to recruiters and applicant tracking systems.
            </p>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '24px' 
          }}>
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="glass-card"
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '12px',
                  backgroundColor: 'rgba(124, 58, 237, 0.1)',
                  color: 'var(--secondary-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default LandingPage;
