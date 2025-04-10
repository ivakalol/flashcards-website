import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Header.css';

function Header({ darkMode, toggleDarkMode }) {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          Flashcards App
        </Link>
        <nav className="navigation">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/study">Study</Link>
            </li>
          </ul>
        </nav>
        <button 
          onClick={toggleDarkMode}
          className="theme-toggle"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}

export default Header;