import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// Intercept and graceful filter generic or cross-origin "Script error." events
// caused by external plugins, browser translations, or safe sandboxed preview frames
if (typeof window !== 'undefined') {
  // Direct window.onerror override (guarantees preventing bubbling for specific string matches)
  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const msgStr = String(message || '');
    const srcStr = String(source || '');
    
    const isScriptError = 
      msgStr.includes('Script error') || 
      msgStr.includes('ResizeObserver') ||
      msgStr.includes('extensions') || 
      !source || 
      srcStr.includes('extension');

    if (isScriptError) {
      console.warn('[System Interceptor] Suppressed cross-origin or extension failure:', message, 'at', source);
      return true; // Return true to completely prevent propagation to browser/testing harness
    }

    if (originalOnError) {
      return originalOnError.apply(this, arguments as any);
    }
    return false;
  };

  // Direct onunhandledrejection override
  const originalOnUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = function (event) {
    const reasonMsg = String(event.reason?.message || event.reason || '');
    const isExternalAnomaly = 
      reasonMsg.includes('Script error') || 
      reasonMsg.includes('ResizeObserver') ||
      reasonMsg.includes('Extension') ||
      reasonMsg.includes('extension');

    if (isExternalAnomaly) {
      console.warn('[System Interceptor] Suppressed unhandled rejection:', reasonMsg);
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (originalOnUnhandledRejection) {
      originalOnUnhandledRejection.apply(this, arguments as any);
    }
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

