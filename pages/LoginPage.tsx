import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      // Navigation is now primarily handled by the AuthContext and ProtectedRoute
      navigate('/dashboard');

    } catch (err: any) {
      setError(err.error_description || err.message);
    }
  };
  
  if (loading || session) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-xl font-semibold text-gray-700">Loading...</div>
        </div>
    );
  }

  return (
    <AuthLayout>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="mt-2 text-sm text-gray-600">Enter your credentials to access your dashboard.</p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="pt-4">
            <label htmlFor="password"  className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign In
          </button>
        </div>
      </form>
      <div className="text-sm text-center mt-4">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;