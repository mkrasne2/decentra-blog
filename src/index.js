import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import AppIndex from './AppIndex.js';
import { HashRouter } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <HashRouter >
    { <AppIndex /> }
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);