import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  // const [isSuccess, setIsSuccess] = useState(false); // isSuccess can be inferred from successful login action
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from AuthContext

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        login(data.token); // Call context login function
        setMessage('Login successful! Redirecting...'); // Keep message for user feedback
        // Clear form
        setUsername('');
        setPassword('');
        navigate('/songs'); // Redirect to /songs
      } else {
        setMessage(data.msg || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An unexpected error occurred. Please try again later.');
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (message) {
      setMessage('');
    }
  };

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
              />
            </div>
            {message && (
              // Determine color based on whether 'successful' is in the message or not for simplicity
              <p className={`text-sm ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full mt-6">
              Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
