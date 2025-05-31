import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.tsx'; // Added import
import Home from './pages/Home.tsx'
import Register from './pages/Register.tsx'
import Login from './pages/Login.tsx' // Import the Login component
import Songs from './pages/Songs.tsx'
import CreateSong from './pages/CreateSong.tsx'; // Added
import EditSong from './pages/EditSong.tsx';   // Added
import { AuthProvider } from './contexts/AuthContext.tsx'; // Import AuthProvider
import ProtectedRoute from './components/ProtectedRoute.tsx'; // Import ProtectedRoute
import './index.css'
import './base-layout.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider> {/* Wrap with AuthProvider */}
      <BrowserRouter>
        <Navbar /> {/* Navbar added here */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} /> {/* Add the login route */}
          <Route path="/songs" element={<Songs />} /> {/* Moved Songs route here */}
          <Route element={<ProtectedRoute />}> {/* Wrap other protected routes */}
            <Route path="/songs/create" element={<CreateSong />} /> {/* Added */}
            <Route path="/songs/:songId/edit" element={<EditSong />} /> {/* Added */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
