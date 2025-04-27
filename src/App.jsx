import React from 'react';
import Header from './Components/Header/Header';
import Footer from './Components/Footer/Footer';
import UploadButton from './components/UploadButton/UploadButton';
import './App.css';

function App() {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        {      <UploadButton />        }
      </main>
      <Footer />
    </div>
  );
}

export default App;