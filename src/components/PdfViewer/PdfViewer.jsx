import React, { useState } from 'react';
import './PdfViewer.css';

export default function PdfViewer({ pdfUrl, pdfName }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!pdfUrl) return null;

  return (
    <div className="pdf-viewer-wrapper">
        {pdfName && (
        <div>
          Loaded: <span className="file-name">{pdfName}</span>
        </div>
      )}
      
      <button 
        className="toggle-button"
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? 'Hide PDF' : 'Show PDF'}
      </button>
      
      {isVisible && (
        <div className="pdf-container">
          <embed
            src={pdfUrl}
            type="application/pdf"
            width="100%"
            height="100%"
            title="PDF Viewer"
          />
        </div>
      )}
    </div>
  );
}