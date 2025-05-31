import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import { AuthContext } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
// Assuming standard <label> with Tailwind for now, as Label from @radix-ui/react-label might not be in components/ui

const CreateSong: React.FC = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [words, setWords] = useState('');
  const [category, setCategory] = useState('');
  const [typology, setTypology] = useState('');
  const [tone, setTone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  if (!authContext) {
    // This should ideally be handled by a global error boundary or a more robust check
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>AuthContext not found. Ensure AuthProvider is correctly set up.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { isAuthenticated, csrfToken, isLoading: authIsLoading } = authContext;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!isAuthenticated) {
      setError("User not authenticated. Please login.");
      setIsLoading(false);
      navigate('/login');
      return;
    }

    if (!csrfToken) {
      setError("CSRF token not available. Cannot submit form. The AuthContext might still be loading or failed to fetch the token.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ title, author, words, category, typology, tone }),
        credentials: 'include',
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          throw new Error(response.statusText || `Failed to create song: ${response.status}`);
        }
        throw new Error(errorData.message || errorData.msg || `Failed to create song: ${response.statusText}`);
      }
      navigate('/songs');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (authIsLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl text-center">
        <p>Loading authentication details...</p>
        {/* Optional: Add a Shadcn Skeleton or Spinner here */}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create New Song</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You need to be logged in to create a song. Please <Link to="/login" className="text-primary hover:underline">login</Link>.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Song</CardTitle>
          <CardDescription>Fill in the details below to add a new song to the collection.</CardDescription>
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
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">Category</label>
                <Input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Worship, Hymn" />
              </div>
              <div>
                <label htmlFor="typology" className="block text-sm font-medium text-foreground mb-1">Typology</label>
                <Input type="text" id="typology" value={typology} onChange={(e) => setTypology(e.target.value)} placeholder="e.g., Praise, Adoration" />
              </div>
              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-foreground mb-1">Tone</label>
                <Input type="text" id="tone" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="e.g., C Major, G Major" />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <span className="animate-spin inline-block mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" role="status" aria-hidden="true"></span>
                  Creating...
                </>
              ) : (
                'Create Song'
              )}
            </Button>
          </form>
        </CardContent>
        {/* <CardFooter>
          <p className="text-xs text-muted-foreground">Optional: Add a footer note here if needed.</p>
        </CardFooter> */}
      </Card>
    </div>
  );
};

export default CreateSong;
