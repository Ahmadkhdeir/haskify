import React, { useRef } from 'react';
import './UploadButton.css';

export default function UploadButton({ onPdfUpload }) {
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current.value = ''; 
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const pdfUrl = URL.createObjectURL(file);
        onPdfUpload(pdfUrl, file.name);
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
    </div>
  );
}