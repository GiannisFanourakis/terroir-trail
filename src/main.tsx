import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthEmailDeliveryNotice } from './components/Auth/AuthEmailDeliveryNotice';
import { AppErrorBoundary } from './components/System/AppErrorBoundary';
import { initGlobalErrorHandlers } from './services/globalErrorHandlers';
import './index.css';

initGlobalErrorHandlers();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
      <AuthEmailDeliveryNotice />
    </AppErrorBoundary>
  </React.StrictMode>
);
