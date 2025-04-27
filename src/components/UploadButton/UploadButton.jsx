import React, { useRef, useState } from 'react';
import './UploadButton.css';

export default function UploadButton() {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      console.log("Selected file:", file.name);
    }
  };

  return (
    <div className="upload-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".hs,.txt,.pdf"
        style={{ display: 'none' }}
      />
      <button 
        className="upload-button"
        onClick={handleButtonClick}
      >
        Upload Content
      </button>
      <p className='note'>* only .pdf files allowed</p>
      {fileName && <div className="file-name">Selected: {fileName}</div>}
    </div>
  );
}