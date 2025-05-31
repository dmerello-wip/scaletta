import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.tsx'
import Register from './pages/Register.tsx'
import Songs from './pages/Songs.tsx'
import './index.css'
import './base-layout.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/songs" element={<Songs />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
