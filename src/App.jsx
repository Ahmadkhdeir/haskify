import React from 'react';
import Header from './Components/Header/Header';
import Footer from './Components/Footer/Footer';
import './App.css';

function App() {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        {/* Your page content goes here */}
      </main>
      <Footer />
    </div>
  );
}

export default App;