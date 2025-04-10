import React from 'react';
import FlashCard from './FlashCard';
import '../styles/components/CardList.css';

function CardList({ cards }) {
  if (!cards || cards.length === 0) {
    return <div className="no-cards">No flashcards available. Create some to get started!</div>;
  }

  return (
    <div className="cards-container">
      {cards.map(card => (
        <FlashCard 
          key={card.id}
          question={card.question}
          answer={card.answer}
        />
      ))}
    </div>
  );
}

export default CardList;