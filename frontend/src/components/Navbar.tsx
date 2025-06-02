import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css'; // Import the CSS file

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">
          scaletta
        </Link>
      </div>
      <div className="navbar-right">
        <Link to="/songs">
          songs
        </Link>
        {isAuthenticated ? (
          <button onClick={logout} className="logout-button">
            logout
          </button>
        ) : (
          <Link to="/login">
            login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
