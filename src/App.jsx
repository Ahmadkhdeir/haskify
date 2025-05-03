import React, { useState } from 'react';
import Header from './Components/Header/Header';
import Footer from './Components/Footer/Footer';
import UploadButton from './components/UploadButton/UploadButton';
import PdfViewer from './components/PdfViewer/PdfViewer';
import './App.css';
import HaskellEditor from './Components/HaskellEditor/HaskellEditor';
import AIAssistant from './Components/AIAssistant/AIAssistant';

function App() {
  const [pdfData, setPdfData] = useState({ url: null, name: null });

  const handlePdfUpload = (url, name) => {
    if (pdfData.url) {
      URL.revokeObjectURL(pdfData.url);
    }
    setPdfData({ url, name });
  };

  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <UploadButton onPdfUpload={handlePdfUpload} />
        <PdfViewer pdfUrl={pdfData.url} pdfName={pdfData.name} />
        
        <div className="code-ai-grid">
          <div className='grid-item'>
            <h2 className="shared-title">Code Editor</h2>
            <HaskellEditor />
          </div>
          
          <div className='grid-item'>
            <h2 className="shared-title">AI Assistant</h2>
            <AIAssistant />
          </div>
          
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;