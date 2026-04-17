
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// Global error handling to catch and suppress benign WebSocket errors in this environment
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.message || event.reason;
  if (typeof reason === 'string' && reason.includes('Websocket closed without opened')) {
    console.warn('Suppressed benign WebSocket error:', reason);
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  const message = event.message;
  if (typeof message === 'string' && message.includes('Websocket closed without opened')) {
    console.warn('Suppressed benign WebSocket error:', message);
    event.preventDefault();
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
