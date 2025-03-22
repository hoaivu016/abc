import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Provider } from 'react-redux';
import { store } from './store';

// Import Mulish font
import '@fontsource/mulish/300.css';
import '@fontsource/mulish/400.css';
import '@fontsource/mulish/500.css';
import '@fontsource/mulish/600.css';
import '@fontsource/mulish/700.css';

// Tạo root element
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = ReactDOM.createRoot(rootElement);

// Render ứng dụng
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
); 