import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login from '@/components/Auth/Login.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom';


createRoot(document.getElementById('root')).render(
  <BrowserRouter>    
    <Routes classname="grid place-items-center">
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  </BrowserRouter>
);