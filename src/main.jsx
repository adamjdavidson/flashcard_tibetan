import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './themes.css'
import App from './App.jsx'
import { ErrorBoundary } from './ErrorBoundary.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'

// Remove unresolved attribute from body (Vite adds this during initial load)
if (document.body.hasAttribute('unresolved')) {
  document.body.removeAttribute('unresolved');
}

const root = document.getElementById('root');
if (!root) {
  console.error('Root element not found!');
} else {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
}
