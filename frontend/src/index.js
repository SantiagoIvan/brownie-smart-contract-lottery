import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

import Home from './App/screens/Home'
import Admin from './App/screens/Admin'
import NotFound from './App/screens/NotFound'

import App from './App';
import { AppContextProvider } from './context/appContext';

ReactDOM.render(
  <React.StrictMode>
    <AppContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />}>
            <Route indexed path="/" element={
              <Home />
            }
            />
            <Route
              path="/admin"
              element={
                <Admin />
              }
            />
          </Route>
          <Route
            path="*"
            element={
              <NotFound />
            }
          />
        </Routes>
      </Router>
    </AppContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
