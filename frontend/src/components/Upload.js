import React, { useRef, useState, useCallback } from 'react';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/bmp';

export default function Upload({ onImageSelected, disabled }) {
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handle = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onImageSelected(file, url);
  }, [onImageSelected]);

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handle(e.dataTransfer.files[0]);
  };

  return (
    <div
      onClick={() => !disabled && fileRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      style={{
        border: `2px dashed ${dragging ? '#22d3ee' : '#1e2d45'}`,
        borderRadius: 16, padding: '40px 20px', textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: dragging ? 'rgba(34,211,238,0.05)' : 'rgba(17,24,39,0.4)',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 12 }}>🐄</div>
      <p style={{ color: '#cbd5e1', fontWeight: 600, marginBottom: 6 }}>
        Drag & drop a cattle image
      </p>
      <p style={{ color: '#475569', fontSize: 13, marginBottom: 16 }}>
        JPG, PNG, WEBP — max 10 MB
      </p>
      <button className="btn btn-secondary" disabled={disabled} onClick={e => { e.stopPropagation(); fileRef.current.click(); }}>
        📁 Browse File
      </button>
      <input ref={fileRef} type="file" accept={ACCEPT} style={{ display: 'none' }}
        onChange={e => handle(e.target.files[0])} />
    </div>
  );
}
