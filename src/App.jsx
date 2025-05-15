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
  const [sharedState, setSharedState] = useState({
    code: `-- Your Haskell code here
main :: IO ()
main = putStrLn "Hello, Haskell!"`,
    output: "> Ready to run Haskell code"
  });

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
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <UploadButton onPdfUpload={handlePdfUpload} />
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
      <Footer />
    </div>
  );
}

export default App;