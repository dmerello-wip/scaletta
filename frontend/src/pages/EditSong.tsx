import React, { useState, useEffect } from 'react'; // Removed useContext
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Added useAuth
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// It's good practice to define interfaces if they are not globally available
// interface SongData {
//   title: string;
//   author: string;
//   words: string;
//   category?: string;
//   typology?: string;
//   tone?: string;
// }

const EditSong: React.FC = () => {
  const { songId } = useParams<{ songId: string }>();
  const navigate = useNavigate();
  const authContext = useAuth(); // Changed to useAuth()

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [words, setWords] = useState('');
  const [category, setCategory] = useState('');
  const [typology, setTypology] = useState('');
  const [tone, setTone] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // For form submission

  useEffect(() => {
    // Ensure authContext is available
    if (!authContext) {
      setIsFetching(false);
      // Error or loading state for authContext itself should be handled by a higher component or globally
      return;
    }

    // Wait for auth context to finish its initial loading
    if (authContext.isLoading) {
      // Still waiting for auth details, including CSRF token
      setIsFetching(true); // Keep isFetching true as we can't fetch song data yet
      return;
    }

    // After auth is loaded, check for authentication
    if (!authContext.isAuthenticated) {
      setError("Please log in to edit songs.");
      setIsFetching(false);
      // navigate('/login'); // Optional: or let ProtectedRoute handle redirection
      return;
    }

    // If authenticated, but CSRF token is somehow missing (should ideally not happen if isLoading is false)
    if (!authContext.csrfToken) {
        setError("CSRF token is missing. Cannot securely fetch song data.");
        setIsFetching(false);
        return;
    }

    if (!songId) {
      setError("Song ID is missing. Cannot fetch song data.");
      setIsFetching(false);
      return;
    }

    const fetchSongData = async () => {
      setIsFetching(true); // Explicitly set true before fetch, though already true initially
      setError(null);
      try {
        // Using relative path as per decision in thought process
        const response = await fetch(`/api/songs/${songId}`, { credentials: 'include' });
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
             throw new Error(response.statusText || `Failed to fetch song details: ${response.status}`);
          }
          throw new Error(errorData.message || errorData.msg || 'Failed to fetch song details.');
        }
        const data = await response.json();
        setTitle(data.title || '');
        setAuthor(data.author || '');
        setWords(data.words || '');
        setCategory(data.category || '');
        setTypology(data.typology || '');
        setTone(data.tone || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsFetching(false);
      }
    };

    fetchSongData();

  }, [songId, authContext]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!authContext || !authContext.isAuthenticated || !authContext.csrfToken) {
      setError("Authentication error or CSRF token missing. Cannot submit.");
      setIsLoading(false);
      return;
    }

    try {
      // Using relative path
      const response = await fetch(`/api/songs/${songId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': authContext.csrfToken,
        },
        body: JSON.stringify({ title, author, words, category, typology, tone }),
        credentials: 'include',
      });
      if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            throw new Error(response.statusText || `Failed to update song: ${response.status}`);
        }
        throw new Error(errorData.message || errorData.msg || 'Failed to update song.');
      }
      navigate('/songs');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (!authContext || authContext.isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl text-center">
        <p>Loading authentication details...</p>
      </div>
    );
  }

  if (!authContext.isAuthenticated) {
     return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card>
          <CardHeader><CardTitle>Edit Song</CardTitle></CardHeader>
          <CardContent>
            <p>You need to be logged in to edit this song. Please <Link to="/login" className="text-primary hover:underline">login</Link>.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl text-center">
        <p>Loading song details...</p>
        {/* Optional: Add a Shadcn Skeleton for form fields here */}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Song</CardTitle>
          <CardDescription>Update the details for "{title || 'this song'}".</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/50 text-destructive rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">Title</label>
              <Input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Song Title" />
            </div>
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-foreground mb-1">Author</label>
              <Input type="text" id="author" value={author} onChange={(e) => setAuthor(e.target.value)} required placeholder="Author Name" />
            </div>
            <div>
              <label htmlFor="words" className="block text-sm font-medium text-foreground mb-1">Words (Lyrics)</label>
              <textarea
                id="words"
                value={words}
                onChange={(e) => setWords(e.target.value)}
                required
                placeholder="Enter song lyrics here..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={6}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">Category</label>
                <Input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Worship" />
              </div>
              <div>
                <label htmlFor="typology" className="block text-sm font-medium text-foreground mb-1">Typology</label>
                <Input type="text" id="typology" value={typology} onChange={(e) => setTypology(e.target.value)} placeholder="e.g., Praise" />
              </div>
              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-foreground mb-1">Tone</label>
                <Input type="text" id="tone" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="e.g., C Major" />
              </div>
            </div>
            <Button type="submit" disabled={isLoading || isFetching} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <span className="animate-spin inline-block mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditSong;
