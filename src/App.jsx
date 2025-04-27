import React, { useState } from 'react';
import Header from './Components/Header/Header';
import Footer from './Components/Footer/Footer';
import UploadButton from './components/UploadButton/UploadButton';
import PdfViewer from './components/PdfViewer/PdfViewer';
import './App.css';

function App() {
  const [pdfData, setPdfData] = useState({ url: null, name: null });

  const handlePdfUpload = (url, name) => {
    setPdfData({ url, name });
  };

  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <UploadButton onPdfUpload={handlePdfUpload} />
        {pdfData.url && (
          <>
            <PdfViewer pdfUrl={pdfData.url} pdfName={pdfData.name} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;