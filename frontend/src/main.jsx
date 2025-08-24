import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Function to display error in the error container
function displayError(error) {
  console.error('Application error:', error);
  const errorContainer = document.getElementById('error-container');
  const errorDetails = document.getElementById('error-details');
  
  if (errorContainer && errorDetails) {
    errorContainer.style.display = 'flex';
    errorDetails.textContent = error?.message || 'Unknown error occurred';
    if (error?.stack) {
      errorDetails.textContent += '\n\nStack trace:\n' + error.stack;
    }
  }
}

// Error boundary for the root component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    displayError(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <p>We're working on fixing this issue. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#4299e1',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main render function
function renderApp() {
  try {
    const root = createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (error) {
    displayError(error);
  }
}

// Add error event listeners
window.addEventListener('error', (event) => {
  displayError(event.error || event);
  return false;
});

window.addEventListener('unhandledrejection', (event) => {
  displayError(event.reason || 'Unhandled promise rejection');
  event.preventDefault();
});

// Start the app
renderApp();
