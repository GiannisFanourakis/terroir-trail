import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthEmailDeliveryNotice } from './components/Auth/AuthEmailDeliveryNotice';
import { AppErrorBoundary } from './components/System/AppErrorBoundary';
import { installAccountCachePrivacyGuard } from './services/accountCachePrivacy';
import { initGlobalErrorHandlers } from './services/globalErrorHandlers';
import './index.css';

initGlobalErrorHandlers();
installAccountCachePrivacyGuard();

if (
  import.meta.env.PROD &&
  'serviceWorker' in navigator &&
  !['localhost', '127.0.0.1'].includes(window.location.hostname)
) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('[PWA] Service worker registration failed:', error);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
      <AuthEmailDeliveryNotice />
    </AppErrorBoundary>
  </React.StrictMode>
);
