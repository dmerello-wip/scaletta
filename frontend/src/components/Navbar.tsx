import React from 'react'; // Removed useContext as it's no longer directly used here
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // MODIFIED
import { Button } from '@/components/ui/button'; // Imported Shadcn Button

const Navbar: React.FC = () => {
  const authContext = useAuth(); // MODIFIED

  if (!authContext) {
    // This case should ideally not happen if AuthProvider is set up correctly
    return (
      <nav className="bg-destructive text-destructive-foreground p-4 text-center">
        Error: AuthContext not found
      </nav>
    );
  }

  const { currentUser, isAuthenticated, logout } = authContext;

  return (
    <nav className="bg-primary text-primary-foreground p-3 shadow-md sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-primary/80">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left side of Navbar: App Name/Logo and core links */}
        <div className="flex items-center space-x-4">
          <Button asChild variant="link" className="text-lg font-semibold text-primary-foreground px-0 hover:no-underline">
            {/* Using px-0 to minimize padding if it's just text, adjust as needed */}
            <Link to="/">SongApp</Link>
          </Button>
          <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/songs">Songs</Link>
          </Button>
        </div>

        {/* Right side of Navbar: Auth-related links and user info */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/songs/create">Create Song</Link>
              </Button>
              {currentUser && (
                <span className="text-sm hidden sm:inline">Welcome, {currentUser.username}</span>
              )}
              <Button
                onClick={logout}
                variant="outline"
                className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
