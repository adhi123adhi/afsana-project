import React, { useState, useCallback } from 'react';
import axios from 'axios';
import Upload from './components/Upload';
import Camera from './components/Camera';
import Result from './components/Result';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TABS = [
  { id: 'upload', label: '📁 Upload', },
  { id: 'camera', label: '📷 Camera', },
];

function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40, gap: 20 }}>
      <div style={{
        width: 60, height: 60, borderRadius: '50%',
        border: '3px solid #1e2d45', borderTopColor: '#22d3ee',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#94a3b8', fontSize: 14 }}>Analysing cattle image…</p>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('upload');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [lang, setLang] = useState('en');

  const handleImage = useCallback((file, url) => {
    setImageFile(file);
    setImageUrl(url);
    setResult(null);
    setError('');
  }, []);

  const predict = async () => {
    if (!imageFile) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      const { data } = await axios.post(`${API}/predict`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }, timeout: 30000,
      });
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.error || 'Backend unreachable. Is the Flask server running on port 5000?');
    } finally {
      setLoading(false);
    }
  };

  const speak = () => {
    if (!result) return;
    const msg = new SpeechSynthesisUtterance();
    if (lang === 'ta') {
      msg.text = `இந்த மாட்டின் இனம் ${result.breed}. நம்பிக்கை ${result.confidence.toFixed(0)} சதவீதம்.`;
      msg.lang = 'ta-IN';
    } else {
      msg.text = `The detected cattle breed is ${result.breed} with ${result.confidence.toFixed(0)} percent confidence.`;
      msg.lang = 'en-IN';
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  };

  const reset = () => {
    setImageFile(null); setImageUrl(null); setResult(null); setError('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Ambient BG blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>

        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="animate-float" style={{ fontSize: 56, marginBottom: 12 }}>🐄</div>
          <h1 style={{
            fontSize: 'clamp(24px,5vw,42px)', fontWeight: 900, marginBottom: 8,
            background: 'linear-gradient(135deg, #22d3ee, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            CattleAI — Breed Recognition
          </h1>
          <p style={{ color: '#64748b', fontSize: 15, maxWidth: 480, margin: '0 auto 20px' }}>
            Real-Time Deep Learning Identification of Indian Cattle Breeds using MobileNetV2
          </p>
          {/* Lang toggle */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {['en', 'ta'].map(l => (
              <button key={l} onClick={() => setLang(l)} className="btn"
                style={{ padding: '6px 18px', fontSize: 13,
                  background: lang === l ? 'rgba(34,211,238,0.15)' : 'transparent',
                  border: `1px solid ${lang === l ? '#22d3ee' : '#1e2d45'}`,
                  color: lang === l ? '#22d3ee' : '#64748b' }}>
                {l === 'en' ? '🇬🇧 English' : '🇮🇳 தமிழ்'}
              </button>
            ))}
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {/* LEFT PANEL */}
          <div>
            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className="btn"
                  style={{ flex: 1, justifyContent: 'center',
                    background: tab === t.id ? 'rgba(34,211,238,0.12)' : 'var(--surface2)',
                    border: `1px solid ${tab === t.id ? '#22d3ee' : '#1e2d45'}`,
                    color: tab === t.id ? '#22d3ee' : '#94a3b8' }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="glass card" style={{ marginBottom: 16 }}>
              {tab === 'upload'
                ? <Upload onImageSelected={handleImage} disabled={loading} />
                : <Camera onCapture={handleImage} disabled={loading} />}
            </div>

            {/* Preview */}
            {imageUrl && (
              <div className="glass card" style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Preview</p>
                <img src={imageUrl} alt="cattle preview"
                  style={{ width: '100%', borderRadius: 10, maxHeight: 220, objectFit: 'cover', display: 'block' }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn btn-primary" onClick={predict} disabled={loading || !imageFile}
                    style={{ flex: 1, justifyContent: 'center' }}>
                    {loading ? '⏳ Analysing…' : '🔍 Identify Breed'}
                  </button>
                  <button className="btn btn-secondary" onClick={reset} disabled={loading}>✕</button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: 14, color: '#f87171', fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div>
            {loading && <div className="glass card"><Spinner /></div>}
            {!loading && !result && (
              <div className="glass card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }}>🔬</div>
                <p style={{ color: '#475569', fontSize: 15 }}>Upload or capture a cattle photo to identify the breed</p>
                <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Gir', 'Sahiwal', 'Jersey', 'Ongole', 'Holstein Friesian'].map(b => (
                    <span key={b} style={{ display: 'inline-block', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '4px 12px', fontSize: 12, color: '#64748b' }}>
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {!loading && result && (
              <Result result={result} lang={lang} onSpeak={speak} />
            )}
          </div>
        </div>

        {/* Footer */}
        <footer style={{ textAlign: 'center', marginTop: 48, color: '#334155', fontSize: 13 }}>
          <p>Real-Time Deep Learning Based Image Breed Recognition System</p>
          <p>Indian Cattle Identification • MobileNetV2 Transfer Learning</p>
        </footer>
      </div>
    </div>
  );
}
