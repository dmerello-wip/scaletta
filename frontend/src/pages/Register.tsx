import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setIsSuccess(false);

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.status === 201) {
        setMessage('Registration successful!');
        setIsSuccess(true);
        setUsername('');
        setPassword('');
      } else {
        setMessage(data.msg || 'Registration failed. Please try again.');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('An unexpected error occurred. Please try again later.');
      setIsSuccess(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (message) {
      setMessage('');
      setIsSuccess(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>Create an account to get started.</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={handleInputChange(setUsername)}
                className="w-full"
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
              />
            </div>
            {message && (
              <p className={`text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full mt-6">
              Register
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;
