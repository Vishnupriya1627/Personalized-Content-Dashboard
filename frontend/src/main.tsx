import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import './index.css';
import App from './App';
import { store, persistor } from '@/store';
import AuthListener from '@/components/auth/AuthListener';
import ThemeSync from '@/components/ThemeSync';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthListener />
        <ThemeSync />
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);