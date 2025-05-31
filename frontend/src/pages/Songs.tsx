import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Adjust path if necessary
import { Button } from '@/components/ui/button'; // For logout button later
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Song {
  _id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
}

const Songs: React.FC = () => {
  const { token, logout } = useAuth(); // Get token and logout function
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      if (!token) {
        setError('Not authenticated. Please login.');
        setIsLoading(false);
        // ProtectedRoute should handle redirection, but good to have a fallback
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/songs`; // Assuming this endpoint
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Include the token in the header
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError('Authentication failed. Please login again.');
            // Optionally call logout() here if token is clearly invalid
          } else {
            const errorData = await response.json();
            setError(errorData.msg || `Error fetching songs: ${response.statusText}`);
          }
          throw new Error('Failed to fetch songs');
        }

        const data: Song[] = await response.json();
        setSongs(data);
      } catch (err) {
        console.error('Error fetching songs:', err);
        if (!error) { // Avoid overwriting specific auth errors
          setError('An unexpected error occurred while fetching songs.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, [token]); // Re-fetch if token changes

  if (isLoading && !error) { // Show loading only if no initial auth error
    return <div className="flex items-center justify-center min-h-screen"><p>Loading songs...</p></div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            Your Songs
          </CardTitle>
          <Button onClick={logout} variant="outline"> {/* Add Logout Button */}
            Logout
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>
          )}
          {!error && songs.length === 0 && !isLoading && (
            <p className="text-center text-gray-500">No songs found. Add some!</p>
          )}
          {!error && songs.length > 0 && (
            <ul className="space-y-3">
              {songs.map((song) => (
                <li key={song._id} className="p-3 border rounded-md shadow-sm bg-gray-50">
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
