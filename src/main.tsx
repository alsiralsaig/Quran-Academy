import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Automatically update service worker immediately without waiting
registerSW({
  immediate: true,
  onNeedRefresh() {
    window.location.reload();
  },
});

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
