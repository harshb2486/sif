// index.js
// Application entry point

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import global styles (Design System)
import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';

// Import Google Fonts (Inter)
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);