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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
      <AuthEmailDeliveryNotice />
    </AppErrorBoundary>
  </React.StrictMode>
);
