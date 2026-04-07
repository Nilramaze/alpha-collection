import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#2d2f2f',
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: { primary: '#2ff801', secondary: '#0d6200' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
