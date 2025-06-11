import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.tsx'
import Register from './pages/Register.tsx'
import Login from './pages/Login.tsx' // Import the Login component
import Songs from './pages/Songs.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'; // Import AuthProvider
import ProtectedRoute from './components/ProtectedRoute.tsx'; // Import ProtectedRoute
import Navbar from './components/Navbar.tsx'; // Import Navbar
import './index.css'
import './base-layout.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider> {/* Wrap with AuthProvider */}
      <BrowserRouter>
        <Navbar /> {/* Add Navbar here */}
        <Routes>
          <Route path="/" element={<Home />} />
        {/* Remove register from here */}
        <Route path="/login" element={<Login />} /> {/* Add the login route */}
          <Route element={<ProtectedRoute />}> {/* Wrap protected routes */}
            <Route path="/register" element={<Register />} /> {/* Register route is now protected */}
            {/* Other protected routes will go here if any */}
          </Route>
          <Route path="/songs" element={<Songs />} /> {/* Songs route is now public */}
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
