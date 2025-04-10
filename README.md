# Flashcards Website

A modern flashcard application for improving study and memorization.

## Features

- Create and manage flashcards
- Study mode with flipping cards
- Mark cards as known/unknown
- Dark/light mode theme
- Responsive design for all devices
- Accessibility features

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm (v6 or newer)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ivakalol/flashcards-website.git
   cd flashcards-website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
 or
🔗 **[Visit the Website](https://ivakalol.github.io/flashcards-website/)**

### Deployment

To deploy to GitHub Pages:

```bash
npm run deploy
```

## Technologies Used

- React
- React Router
- CSS3
- GitHub Actions (CI/CD)

## Folder Structure

```
flashcards-website/
├── public/                       # Static files
├── src/                          # Source code
│   ├── components/               # UI components
│   ├── styles/                   # CSS files
│   ├── pages/                    # Page components
│   ├── utils/                    # Helper functions
│   ├── App.js                    # Main App component
│   └── index.js                  # Entry point
└── package.json                  # Dependencies and scripts
```

## Future Enhancements

- User authentication
- Saving cards to the cloud
- Spaced repetition algorithm
- Export/import functionality
- Mobile app version