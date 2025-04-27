import React, { useState } from 'react';
import './PdfViewer.css';

export default function PdfViewer({ pdfUrl }) {
  const [isVisible, setIsVisible] = useState(false);

  if (!pdfUrl) return null;

  return (
    <div className="pdf-viewer-wrapper">
      <button 
        className="toggle-button"
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? 'Hide PDF' : 'View PDF'}
      </button>
      
      {isVisible && (
        <div className="pdf-container">
          <embed
            src={pdfUrl}
            type="application/pdf"
            width="100%"
            height="500px"
          />
        </div>
      )}
    </div>
  );
}