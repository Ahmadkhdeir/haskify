import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="haskify-footer">
      <div className="footer-content">
        <a href="/contact" className="footer-link">Contact us</a>
        <span className="copyright">All rights reserved © 2025</span>
        <a href="/documentation" className="footer-link">Documentation</a>
      </div>
    </footer>
  );
}