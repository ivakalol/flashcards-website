import React, { useState } from 'react';
import CardList from '../components/CardList';
import '../styles/pages/Study.css';

function Study({ cards }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCards = cards.filter(card => 
    card.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    card.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="study-page">
      <div className="study-header">
        <h1>Study Flashcards</h1>
        <div className="search-container">
          <input 
            type="text"
            placeholder="Search flashcards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search flashcards"
          />
        </div>
      </div>
      
      <CardList cards={filteredCards} />
    </div>
  );
}

export default Study;