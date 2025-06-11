import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define User interface
interface User {
  id: string;
  username: string;
}

// Define AuthContextType interface
interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  isLoading: boolean;
  login: (credentials: { username?: string; password?: string; email?: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  // csrfToken: string | null; // No need to expose via context, it's an internal detail
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // For auth status and initial CSRF token
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/csrf-token`, {
        method: 'GET',
        credentials: 'include', // Important for the server to set the _csrf-secret cookie if not already present
      });
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } else {
        console.error('Failed to fetch CSRF token');
        // Handle this error appropriately, maybe retry or block further actions
        setCsrfToken(null); // Ensure it's reset
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      setCsrfToken(null); // Ensure it's reset
    }
  };

  const checkAuthStatus = async () => {
    // No need to set isLoading here if combined with initialLoad
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/status`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isAuthenticated && data.user) {
          setIsAuthenticated(true);
          setCurrentUser(data.user);
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
    // setIsLoading(false) will be handled by the combined initial load function
  };

  // Combined initial load function
  const initializeAuth = async () => {
    setIsLoading(true);
    await fetchCsrfToken(); // Fetch CSRF token first
    await checkAuthStatus(); // Then check auth status
    setIsLoading(false);
  };

  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const login = async (credentials: { username?: string; password?: string; email?: string }) => {
    if (!csrfToken) {
      console.error('CSRF token not available for login. Attempting to fetch again.');
      await fetchCsrfToken(); // Try to fetch CSRF token again if it's missing
      if (!csrfToken) { // Check again after attempting to fetch
         throw new Error('CSRF token is missing. Please try again.');
      }
    }
    // No need to setIsLoading(true) here as login forms usually have their own submission state
    // setIsLoading(true); // This isLoading is for the global auth state, not form submission
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken!, // Assert non-null as we checked/fetched it
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        // After successful login, the CSRF token might be rotated by the server if csurf is configured to do so.
        // It's good practice to fetch a new one.
        await fetchCsrfToken();
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        throw new Error(data.msg || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Consider if isAuthenticated and currentUser should be reset here.
      // If login fails, existing auth state might still be valid or become invalid.
      // checkAuthStatus might be needed, or rely on the error message.
      // For now, we throw, assuming the component handles UI update.
      throw error;
    } finally {
      // setIsLoading(false); // Matches the comment above
    }
  };

  const logout = async () => {
    if (!csrfToken) {
      console.error('CSRF token not available for logout. Attempting to fetch again.');
      await fetchCsrfToken();
      if (!csrfToken) {
        throw new Error('CSRF token is missing. Please try again.');
      }
    }
    // setIsLoading(true); // Similar to login, component might handle its own loading state
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Though logout might not need a body, consistency is fine
          'X-CSRF-Token': csrfToken!,
        },
        credentials: 'include',
      });

      // Regardless of server response success/failure, clear client-side auth state
      setIsAuthenticated(false);
      setCurrentUser(null);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.msg || 'Logout failed on server');
      }
      // After successful logout, fetch a new CSRF token for subsequent actions (e.g. login)
      await fetchCsrfToken();
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure client state is reset even if network error or other issue occurs
      setIsAuthenticated(false);
      setCurrentUser(null);
      // Fetch a new CSRF token even on error to be safe for next operations
      await fetchCsrfToken();
      throw error; // Re-throw if component needs to react
    } finally {
      // setIsLoading(false);
    }
  };

  if (isLoading) { // This is the initial loading for auth and CSRF
    return null; // Or a global loading spinner
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentUser, isLoading, login, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
