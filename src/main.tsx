import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { PreferencesProvider } from './app/providers/PreferencesProvider';
import { OfflineQueueProvider } from './app/providers/OfflineQueueProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreferencesProvider>
      <OfflineQueueProvider>
        <App />
      </OfflineQueueProvider>
    </PreferencesProvider>
  </StrictMode>,
);
