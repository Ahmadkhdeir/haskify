import React, { useState, useEffect } from 'react';
import './PdfViewer.css';

export default function PdfViewer({ pdfUrl}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  if (!pdfUrl) return null;

  return (
    <div className="pdf-viewer-wrapper">

      
      <button 
        className="toggle-button"
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? 'Hide PDF' : 'Show PDF'}
      </button>
      
      {isVisible && (
        <div className="pdf-container">
          <embed
            key={pdfUrl} 
            src={pdfUrl}
            type="application/pdf"
            width="100%"
            height="100%"
          />
        </div>
      )}
    </div>
  );
}