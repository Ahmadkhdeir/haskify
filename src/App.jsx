import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './Components/Header/Header';
import Footer from './Components/Footer/Footer';
import UploadButton from './Components/UploadButton/UploadButton';
import PdfViewer from './Components/PdfViewer/PdfViewer';
import HaskellEditor from './Components/HaskellEditor/HaskellEditor';
import AIAssistant from './Components/AIAssistant/AIAssistant';
import ContactModal from './Components/ContactModal/ContactModal';
import HowItWorksModal from './Components/HowItWorksModal/HowItWorksModal';

function App() {
  const [loading, setLoading] = useState(true);
  const [pdfData, setPdfData] = useState({ url: null, name: null });
  const [showUploadButton, setShowUploadButton] = useState(false);
  const [sharedState, setSharedState] = useState({
    code: `-- Your Haskell code here
main :: IO ()
main = putStrLn "Hello, Haskell!"`,
    output: "> Ready to run Haskell code"
  });
  const [isContactOpen, setContactOpen] = useState(false);
  const [isHowItWorksOpen, setHowItWorksOpen] = useState(false);

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
        const response = await fetch(`${API_BASE}/health`);
        if (response.ok) {
          // backend is connected
        }
      } catch (error) {
        console.error("Backend connection failed", error);
        setSharedState(prev => ({ ...prev, output: "> Error: Backend not connected" }));
      } finally {
        setLoading(false);
      }
    };

    checkBackendHealth();
  }, []);

  const handlePdfUpload = (url, name) => {
    if (pdfData.url) {
      URL.revokeObjectURL(pdfData.url);
    }
    setPdfData({ url, name });
  };

  const updateSharedState = (newState) => {
    setSharedState(prev => ({ ...prev, ...newState }));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="app-layout">
              {}
              {loading && (
                <div className="loading-overlay">
                  <div className="loading-spinner">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                  <p className="loading-text">Getting things ready...</p>
                </div>
              )}

              <Header onHowItWorksClick={() => setHowItWorksOpen(true)} />
              <main className="main-content">
                {showUploadButton && <UploadButton onPdfUpload={handlePdfUpload} />}
                <PdfViewer pdfUrl={pdfData.url} pdfName={pdfData.name} />

                <div className="code-ai-grid">
                  <div className='grid-item'>
                    <h2 className="shared-title">Code Editor</h2>
                    <HaskellEditor 
                      sharedState={sharedState}
                      updateSharedState={updateSharedState}
                    />
                  </div>
                  
                  <div className='grid-item'>
                    <h2 className="shared-title">AI Assistant</h2>
                    <AIAssistant 
                      sharedState={sharedState}
                      updateSharedState={updateSharedState}
                    />
                  </div>
                </div>
              </main>
              <Footer onContactClick={() => setContactOpen(true)} />
              <HowItWorksModal isOpen={isHowItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
              <ContactModal isOpen={isContactOpen} onClose={() => setContactOpen(false)} />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
