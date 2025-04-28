import React, { useState } from 'react';
import Header from './Components/Header/Header';
import Footer from './Components/Footer/Footer';
import UploadButton from './components/UploadButton/UploadButton';
import PdfViewer from './components/PdfViewer/PdfViewer';
import './App.css';
import HaskellEditor from './Components/HaskellEditor/HaskellEditor';

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
        <HaskellEditor />
      </main>
      <Footer />
    </div>
  );
}

export default App;