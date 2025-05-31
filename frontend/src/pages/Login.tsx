import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Local loading state for the form submission

  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth(); // Get login, isAuthenticated, and isLoading from AuthContext

  // Redirect if already authenticated
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      navigate('/songs'); // Or your default authenticated route
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await login({ username, password }); // Call context login function
      // AuthContext's login function will set isAuthenticated and currentUser
      // The useEffect above will handle redirection upon isAuthenticated changing.
      // No explicit navigation here is needed if useEffect handles it.
      // setMessage('Login successful! Redirecting...'); // Feedback can be handled by global notifications or simply redirect
      setUsername(''); // Clear form
      setPassword('');
      // navigate('/songs'); // Let useEffect handle redirection
    } catch (error: any) {
      // The login function in AuthContext should throw an error with a message
      setErrorMessage(error.message || 'Login failed. Please check your credentials.');
      console.error('Login page error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (errorMessage) {
      setErrorMessage(''); // Clear error message on input change
    }
  };

  // Prevent rendering the login form if auth state is still loading or if already authenticated
  // This helps avoid flicker or showing the form briefly before redirecting
  if (isAuthLoading) {
    return <div>Loading authentication status...</div>; // Or a spinner
  }

  // If isAuthenticated becomes true after check (e.g. due to previous session)
  // and useEffect hasn't redirected yet, this can prevent form render.
  // However, useEffect is generally preferred for navigation side effects.
  // This check might be redundant if useEffect is robust.
  if (isAuthenticated) {
     // This typically won't be seen if useEffect is working correctly, as it would have redirected.
     // Consider it a fallback or remove if useEffect is sufficient.
    return <div>Already logged in. Redirecting...</div>;
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Access your account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={handleInputChange(setUsername)}
                className="w-full"
                autoComplete="username"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={handleInputChange(setPassword)}
                className="w-full"
                autoComplete="current-password"
                disabled={isSubmitting}
              />
            </div>
            {errorMessage && (
              <p className="text-sm text-red-600">
                {errorMessage}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
