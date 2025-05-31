import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // CardDescription might be useful too

interface Song {
  _id: string;
  title: string;
  author: string;
  words: string;
  category?: string;
  typology?: string;
  tone?: string;
}

const Songs: React.FC = () => {
  const { isAuthenticated, currentUser, isLoading: isAuthLoading, logout, csrfToken } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      setIsLoadingSongs(true);
      setError(null);
      try {
        // Using relative path for API call
        const response = await fetch('/api/songs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.msg || `Error fetching songs: ${response.statusText}`);
          setSongs([]);
        } else {
          const data: Song[] = await response.json();
          setSongs(data);
        }
      } catch (err) {
        console.error('Error fetching songs:', err);
        setError('An unexpected error occurred while fetching songs.');
      } finally {
        setIsLoadingSongs(false);
      }
    };

    if (!isAuthLoading) {
      fetchSongs();
    }
  }, [isAuthLoading]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
      setError("Logout failed. Please try again.");
    }
  };

  const handleDelete = async (songId: string) => {
    if (!isAuthenticated || !csrfToken) {
      setError("Authentication or CSRF token not available. Cannot delete song.");
      return;
    }
    if (!window.confirm('Are you sure you want to delete this song?')) {
      return;
    }
    setIsDeleting(songId);
    setError(null);
    try {
      // Using relative path for API call
      const response = await fetch(`/api/songs/${songId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete song');
      }
      setSongs(prevSongs => prevSongs.filter(song => song._id !== songId));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsDeleting(null);
    }
  };

  if (isAuthLoading) {
    return <div className="container mx-auto p-4 text-center"><p>Verifying authentication...</p></div>;
  }

  if (isLoadingSongs) {
    return <div className="container mx-auto p-4 text-center"><p>Loading songs...</p></div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full mb-6"> {/* Added mb-6 for spacing below main card */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4"> {/* Adjusted padding */}
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
        {/* Error display for fetchSongs, moved out of map to be more prominent */}
        {error && (
          <CardContent> {/* Wrap error in CardContent for consistent padding */}
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/50 text-destructive rounded-md text-center">
              <p>{error}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {!error && songs.length === 0 && !isLoadingSongs && (
        <div className="text-center text-muted-foreground py-8">
          <Card className="w-full max-w-md mx-auto"> {/* Optional: Wrap "no songs" in a card too */}
            <CardContent className="pt-6"> {/* Added pt-6 for padding */}
              <h3 className="text-lg font-semibold mb-2">No songs found.</h3>
              {isAuthenticated && (
                <Button asChild variant="link" className="mt-2 text-base">
                  <Link to="/songs/create">Create your first song!</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!error && songs.length > 0 && (
        <div className="space-y-4">
          {songs.map((song) => (
            <Card key={song._id} className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 pt-4 px-5"> {/* Adjusted padding */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-xl font-semibold text-primary">{song.title}</CardTitle>
                    <p className="text-sm text-muted-foreground pt-1">Author: {song.author}</p>
                  </div>
                  {isAuthenticated && (
                    <div className="flex space-x-2 pt-1 sm:pt-0 flex-shrink-0">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/songs/${song._id}/edit`}>Edit</Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(song._id)}
                        disabled={isDeleting === song._id}
                      >
                        {isDeleting === song._id ? (
                          <>
                            <span className="animate-spin inline-block mr-1.5 h-4 w-4 border-2 border-current border-t-transparent rounded-full" role="status" aria-hidden="true"></span>
                            Deleting...
                          </>
                        ) : (
                          'Delete'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-4">
                {song.category && <p className="text-sm text-muted-foreground">Category: {song.category}</p>}
                {song.typology && <p className="text-sm text-muted-foreground">Typology: {song.typology}</p>}
                {song.tone && <p className="text-sm text-muted-foreground">Tone: {song.tone}</p>}
                {song.words && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Lyrics Snippet</h4>
                    <p className="text-sm text-foreground leading-relaxed">
                      {song.words.substring(0, 150)}{song.words.length > 150 ? '...' : ''}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Songs;
