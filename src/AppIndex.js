import React from 'react';
import { useEffect } from 'react';
import abi from './components/abi.json';
import App from './App.js';
import Header from './components/Navigation.js';
import Create from './Create.js';
import {  BrowserRouter as Router, Routes, Route } from "react-router-dom";


function Home() {
return (
  <div>
  <Header />
  <App />
  </div>
)
}

function Creating() {
  return (
    <div>
    <Header />
    <Create />
    </div>
  )
  }



export default function AppIndex() {
  return (
    <div >
    <Routes>
      <Route  path='/' element={<Home />} />
    </Routes>
    <Routes>
      <Route  path='/create'  element={<Creating />}/>
    </Routes>
    
  
  </div>
  );
}