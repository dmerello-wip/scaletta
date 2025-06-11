import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Song {
  _id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
}

const Songs: React.FC = () => {
  // Use new context values: isAuthenticated, currentUser, isLoading (for auth context), and the new logout
  const { isAuthenticated, currentUser, isLoading: isAuthLoading, logout } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true); // Separate loading state for songs
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      // Wait for auth loading to complete before deciding to fetch or use currentUser
      if (isAuthLoading) {
        setIsLoadingSongs(false); // Ensure loading state is reset if we return early
        return;
      }

      // Now, fetch songs regardless of authentication status.
      // User-specific actions (like personalizing content) can be based on isAuthenticated.
      setIsLoadingSongs(true);
      setError(null);

      try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/songs`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Authorization header is no longer needed; cookies are sent automatically
          },
          credentials: 'include', // Ensure cookies are sent
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401 || response.status === 403) {
            setError(errorData.msg || 'Authentication failed. You might be logged out.');
            // Consider calling logout() here or relying on AuthContext's checkAuthStatus
            // or ProtectedRoute to handle this scenario.
            // If the cookie is invalid, the user should ideally be redirected to login.
          } else {
            setError(errorData.msg || `Error fetching songs: ${response.statusText}`);
          }
          // throw new Error('Failed to fetch songs'); // Avoid throwing here to display error in UI
          setSongs([]); // Clear songs on error
        } else {
          const data: Song[] = await response.json();
          setSongs(data);
        }
      } catch (err) {
        console.error('Error fetching songs:', err);
        if (!error) {
          setError('An unexpected error occurred while fetching songs.');
        }
      } finally {
        setIsLoadingSongs(false);
      }
    };

    // Wait for auth loading to complete before fetching
    if (!isAuthLoading) {
      fetchSongs();
    }
  // Depend on isAuthenticated and isAuthLoading to refetch if auth state changes,
  // or when auth loading finishes.
  }, [isAuthenticated, isAuthLoading]);

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation to /login will be handled by ProtectedRoute or Login page's useEffect
    } catch (err) {
      console.error("Logout failed", err);
      // Optionally display an error message to the user
    }
  };

  // This state is primarily for the initial load of the auth status
  if (isAuthLoading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Verifying authentication...</p></div>;
  }

  // Songs page is now public, so we don't redirect if not authenticated.
  // We just won't show user-specific content.

  // Display loading for songs
  if (isLoadingSongs) {
    return <div className="flex items-center justify-center min-h-screen"><p>Loading songs...</p></div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">
              Songs
            </CardTitle>
            {isAuthenticated && currentUser && (
              <p className="text-sm text-muted-foreground">
                Welcome, {currentUser.username}!
              </p>
            )}
          </div>
          {isAuthenticated && (
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-red-600 bg-red-100 p-3 rounded-md text-center mb-4">{error}</p>
          )}
          {/* Ensure isLoadingSongs is false before showing "No songs found" */}
          {!error && songs.length === 0 && !isLoadingSongs && (
            <p className="text-center text-gray-500">No songs found. Add some!</p>
          )}
          {!error && songs.length > 0 && (
            <ul className="space-y-3">
              {songs.map((song) => (
                <li key={song._id} className="p-3 border rounded-md shadow-sm bg-gray-50 hover:bg-gray-100">
                  <h3 className="text-lg font-semibold">{song.title}</h3>
                  <p className="text-sm text-gray-700">Artist: {song.artist}</p>
                  {song.album && <p className="text-sm text-gray-600">Album: {song.album}</p>}
                  {song.genre && <p className="text-sm text-gray-600">Genre: {song.genre}</p>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Songs;
