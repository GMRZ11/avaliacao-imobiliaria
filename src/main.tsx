import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Create a root and render the top level React component.  On
// subsequent renders React will reuse the existing DOM tree.  See
// https://react.dev/learn#react-dom for more details.
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);