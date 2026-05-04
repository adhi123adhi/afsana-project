import React, { useEffect, useState } from 'react';

const COLORS = {
  'Gir': '#f59e0b', 'Sahiwal': '#10b981', 'Tharparkar': '#3b82f6',
  'Rathi': '#8b5cf6', 'Ongole': '#ef4444', 'Kankrej': '#6366f1',
  'Hallikar': '#14b8a6', 'Holstein Friesian': '#64748b', 'Jersey': '#d97706', 'Red Sindhi': '#dc2626',
};

const TA_NAMES = {
  'Gir': 'கிர்', 'Sahiwal': 'சாஹிவால்', 'Tharparkar': 'தார்பார்கர்',
  'Rathi': 'ராதி', 'Ongole': 'ஓங்கோல்', 'Kankrej': 'கங்க்ரேஜ்',
  'Hallikar': 'ஹல்லிகர்', 'Holstein Friesian': 'ஹோல்ஸ்டீன்', 'Jersey': 'ஜெர்சி', 'Red Sindhi': 'ரெட் சிந்தி',
};

function Bar({ pct, color, label, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 100 + delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 13, color: '#94a3b8' }}>{pct.toFixed(1)}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${w}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
      </div>
    </div>
  );
}

export default function Result({ result, lang, onSpeak }) {
  const { breed, confidence, info, top3, model_status } = result;
  const color = COLORS[breed] || '#22d3ee';
  const taName = TA_NAMES[breed] || breed;

  return (
    <div className="animate-fadein">
      {/* Hero result */}
      <div style={{
        background: `linear-gradient(135deg, ${color}18, ${color}08)`,
        border: `1px solid ${color}40`, borderRadius: 16, padding: 24, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
              Detected Breed
            </p>
            <h2 style={{ fontSize: 32, fontWeight: 800, color, marginBottom: 4 }}>{breed}</h2>
            {lang === 'ta' && <p style={{ fontSize: 18, color: `${color}cc` }}>{taName}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className={`badge badge-${model_status === 'trained' ? 'trained' : 'mock'}`}>
              {model_status === 'trained' ? '✓ AI Model' : '⚡ Demo Mode'}
            </span>
            <div style={{ fontSize: 40, fontWeight: 900, color, marginTop: 8 }}>
              {confidence.toFixed(1)}%
            </div>
            <p style={{ color: '#94a3b8', fontSize: 12 }}>Confidence</p>
          </div>
        </div>

        {/* Confidence ring */}
        <div style={{ marginTop: 16 }} className="progress-bar">
          <div className="progress-fill" style={{ width: `${confidence}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
        </div>
      </div>

      {/* Breed info */}
      {info && Object.keys(info).length > 0 && (
        <div className="glass card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 14, fontSize: 14, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>Breed Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            {info.origin && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px' }}>
                <p style={{ fontSize: 11, color: '#64748b', marginBottom: 3 }}>ORIGIN</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{info.origin}</p>
              </div>
            )}
            {info.milk_yield && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px' }}>
                <p style={{ fontSize: 11, color: '#64748b', marginBottom: 3 }}>MILK YIELD</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{info.milk_yield}</p>
              </div>
            )}
          </div>
          {info.description && <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>{info.description}</p>}
        </div>
      )}

      {/* Top-3 */}
      {top3 && top3.length > 1 && (
        <div className="glass card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 14, fontSize: 14, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>Top Predictions</h3>
          {top3.map((item, i) => (
            <Bar key={item.breed} label={`${i + 1}. ${item.breed}`}
              pct={item.confidence} color={COLORS[item.breed] || '#22d3ee'} delay={i * 150} />
          ))}
        </div>
      )}

      {/* TTS button */}
      <button className="btn btn-secondary" onClick={onSpeak} style={{ width: '100%', justifyContent: 'center' }}>
        🔊 {lang === 'ta' ? 'குரல் வெளியீடு' : 'Speak Result'}
      </button>
    </div>
  );
}
