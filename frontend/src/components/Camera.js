import React, { useRef, useState, useEffect } from 'react';

export default function Camera({ onCapture, disabled }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState('');

  const start = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported. If accessing via network IP, you must use HTTPS.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setActive(true); setError('');
    } catch (err) {
      setError(err.message || 'Camera access denied. Please allow camera permissions.');
    }
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setActive(false);
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      onCapture(file, url);
      stop();
    }, 'image/jpeg', 0.92);
  };

  useEffect(() => () => stop(), []);

  return (
    <div style={{ textAlign: 'center' }}>
      {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</p>}
      
      <div style={{ display: active ? 'block' : 'none' }}>
        <video ref={videoRef} autoPlay playsInline
          style={{ width: '100%', borderRadius: 12, marginBottom: 12, maxHeight: 260, objectFit: 'cover' }} />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={capture}>📸 Capture</button>
          <button className="btn btn-secondary" onClick={stop}>✕ Stop</button>
        </div>
      </div>

      {!active && (
        <button className="btn btn-secondary" onClick={start} disabled={disabled}
          style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>
          📷 Open Camera
        </button>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
