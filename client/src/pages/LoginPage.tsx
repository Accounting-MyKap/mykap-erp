import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      // La navegación al dashboard la maneja el AuthContext
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 px-12 bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-6">
          <img src="/logo-full.png" alt="MyKap Logo" className="w-40 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-gray-500">Enter your credentials to access your dashboard.</p>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
            Sign In
          </button>
        </form>
        <p className="mt-6 text-sm text-center text-gray-600">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}