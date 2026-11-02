import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import { API_BASE } from '../utils/adminUtils';

export default function ImageUploader({ images = [], onChange, single = false }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Normalize images to always be a safe array of strings
  const imgs = Array.isArray(images) 
    ? images 
    : (typeof images === 'string' && images ? [images] : []);

  const uploadFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const filesToUpload = single ? Array.from(files).slice(0, 1) : Array.from(files);
      const formData = new FormData();
      filesToUpload.forEach((file) => formData.append('images', file));
      
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const uploadedUrls = data.urls || [];
      onChange(single ? uploadedUrls : [...imgs, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  };

  const removeImage = (idx) => onChange(imgs.filter((_, i) => i !== idx));

  const moveImage = (from, to) => {
    const arr = [...imgs];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onChange(arr);
  };

  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        {single ? 'Category Image' : 'Product Images'} {imgs.length > 0 && <span style={{ color: '#C4705A' }}>({imgs.length}) {!single && '- first image is cover'}</span>}
      </label>

      <div
        onClick={() => !uploading && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? '#C4705A' : '#EDE8E3'}`,
          borderRadius: 10,
          padding: '1.5rem',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: dragOver ? '#FFF8F5' : '#FDFBF9',
          transition: 'all 0.2s',
          marginBottom: 12,
        }}
      >
        {uploading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#9CA3AF' }}>
            <div style={{ width: 18, height: 18, border: '2px solid #EDE8E3', borderTop: '2px solid #C4705A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Uploading...
          </div>
        ) : (
          <>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{'\u{1F4F7}'}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1218' }}>Click or drag & drop images</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>JPG, PNG, WebP - max 5MB each {!single && '- up to 5 at once'}</div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={!single}
          style={{ display: 'none' }}
          onChange={(e) => uploadFiles(e.target.files)}
        />
      </div>

      {imgs.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {imgs.map((url, i) => (
            <div key={(url || '') + i} style={{ position: 'relative', width: 90, height: 90, borderRadius: 8, overflow: 'hidden', border: i === 0 && !single ? '2.5px solid #C4705A' : '1.5px solid #EDE8E3', flexShrink: 0 }}>
              <img
                src={url && url.startsWith('http') ? url : `${API_BASE}${url || ''}`}
                alt={`Uploaded ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90"><rect width="90" height="90" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24">img</text></svg>';
                }}
              />
              {i === 0 && !single && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(196,112,90,0.85)', color: '#fff', fontSize: 9, fontWeight: 700, textAlign: 'center', padding: '2px 0', letterSpacing: '0.05em' }}>
                  COVER
                </div>
              )}
              <div style={{ position: 'absolute', top: 3, right: 3, display: 'flex', gap: 3 }}>
                {i > 0 && !single && (
                  <button onClick={() => moveImage(i, i - 1)} title="Move left" style={{ width: 20, height: 20, borderRadius: 4, background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {'\u2190'}
                  </button>
                )}
                <button onClick={() => removeImage(i)} title="Remove" style={{ width: 20, height: 20, borderRadius: 4, background: 'rgba(185,28,28,0.85)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {'\u00d7'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
