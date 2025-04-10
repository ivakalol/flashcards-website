import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Study from './pages/Study';

// Sample data - in a real app, this would come from an API or database
const initialCards = [
  { id: 1, question: 'What is React?', answer: 'A JavaScript library for building user interfaces' },
  { id: 2, question: 'What is JSX?', answer: 'A syntax extension for JavaScript recommended for use with React' },
  { id: 3, question: 'What is a Component?', answer: 'Independent, reusable pieces of the UI' },
  { id: 4, question: 'What is the Virtual DOM?', answer: 'A programming concept where a virtual representation of the UI is kept in memory' },
];

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [cards, setCards] = useState(initialCards);

  // Check for saved theme preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.body.classList.add('dark-mode');
    }
  }, []);

  // Toggle dark/light mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.body.classList.toggle('dark-mode', newDarkMode);
  };

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/study" element={<Study cards={cards} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;