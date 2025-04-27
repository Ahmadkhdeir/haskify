import React from 'react';
import './Header.css';
import logo from '../../assets/logo.png';

export default function Header() {
  return (
    <header className="haskify-header">
      <div className="header-content">
        <div className="logo-container">
          <img src={logo} alt="Haskify Logo" className="logo" />
          <span className="app-name">Haskify</span>
        </div>
        <nav className="header-nav">
          <a href="/" className="nav-link">Home</a>
          <a href="/how-it-works" className="nav-link">How Does It Work?</a>
        </nav>
      </div>
    </header>
  );
}