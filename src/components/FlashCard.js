import React, { useState } from 'react';
import '../styles/components/FlashCard.css';

function FlashCard({ question, answer }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isKnown, setIsKnown] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMarkAsKnown = (e) => {
    e.stopPropagation();
    setIsKnown(!isKnown);
  };

  return (
    <div 
      className={`flashcard ${isFlipped ? 'flipped' : ''} ${isKnown ? 'known' : ''}`}
      onClick={handleCardClick}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCardClick();
        }
      }}
      tabIndex="0"
      role="button"
      aria-pressed={isFlipped}
      aria-label={`Flashcard: ${question}. Press Enter to flip.`}
    >
      <div className="card-inner">
        <div className="card-front">
          <h3 className="card-title">Question:</h3>
          <p className="card-content">{question}</p>
          <div className="card-instructions" aria-hidden="true">Click to reveal answer</div>
        </div>
        <div className="card-back">
          <h3 className="card-title">Answer:</h3>
          <p className="card-content">{answer}</p>
          <button
            onClick={handleMarkAsKnown}
            className={`known-button ${isKnown ? 'known' : ''}`}
            aria-label={isKnown ? "Mark as not known" : "Mark as known"}
          >
            {isKnown ? "Not Known" : "Known"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FlashCard;