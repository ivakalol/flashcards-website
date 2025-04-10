import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/Home.css';

function Home() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to Flashcards App</h1>
        <p>Improve your learning with our simple and effective flashcard system</p>
        <Link to="/study" className="cta-button">Start Studying</Link>
      </div>
      
      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Create Custom Flashcards</h3>
            <p>Make your own flashcards tailored to your learning needs</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Spaced Repetition</h3>
            <p>Review cards at optimal intervals for better retention</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Progress</h3>
            <p>Monitor your learning progress with detailed statistics</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;