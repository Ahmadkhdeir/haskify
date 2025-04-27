import React, { useRef, useState } from 'react';
import './UploadButton.css';

export default function UploadButton({ onPdfUpload }) {
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setError('');
        const pdfUrl = URL.createObjectURL(file);
        onPdfUpload(pdfUrl, file.name);
      } else {
        setError('Please select a PDF file only');
      }
    }
  };

  return (
    <div className="upload-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,application/pdf"
        style={{ display: 'none' }}
      />
      <button className="upload-button" onClick={handleUploadClick}>
        Upload PDF
      </button>
      <p className="note">Only .pdf files allowed</p>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}