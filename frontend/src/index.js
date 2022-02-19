import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { AppContextProvider } from './context/appContext';
import './index.css'

ReactDOM.render(
  <React.StrictMode>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
