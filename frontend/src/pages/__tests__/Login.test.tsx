import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext'; // Adjust path if needed
import Login from '../Login'; // Adjust path if needed

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock global fetch
global.fetch = vi.fn();

const AllTheProviders: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <AuthProvider>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </AuthProvider>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    vi.resetAllMocks(); // Reset mocks before each test
    localStorage.clear(); // Clear localStorage
  });

  it('should render login form', () => {
    render(<Login />, { wrapper: AllTheProviders });
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('should allow typing in username and password fields', () => {
    render(<Login />, { wrapper: AllTheProviders });
    const usernameInput = screen.getByPlaceholderText('Username') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  it('should display error message on failed login', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ msg: 'Invalid credentials' }),
    });

    render(<Login />, { wrapper: AllTheProviders });

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should call login context function and navigate on successful login', async () => {
    const mockToken = 'fake-jwt-token';
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: mockToken }),
    });

    // We need to spy on localStorage.setItem because AuthContext calls it.
    // Or, more simply, check its effect.

    render(<Login />, { wrapper: AllTheProviders });

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText('Login successful! Redirecting...')).toBeInTheDocument();
    });

    // Check if AuthContext's login function (which calls localStorage.setItem) worked
    // This requires AuthProvider to be set up to actually call localStorage
    // or for us to mock useAuth and spy on the login function.
    // For simplicity here, we'll check localStorage and navigation.
    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(mockNavigate).toHaveBeenCalledWith('/songs');
  });
});

// Note: For these tests to run, you'd need Vitest, jsdom, and @testing-library/react
// set up in your frontend project.
// Add: import '@testing-library/jest-dom'; to your test setup file for matchers like .toBeInTheDocument()
