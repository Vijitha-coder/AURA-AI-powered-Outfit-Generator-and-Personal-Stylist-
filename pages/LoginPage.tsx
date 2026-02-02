import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg p-8 w-full max-w-md border border-accent-secondary/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent-primary flex items-center justify-center space-x-2">
            <Sparkles className="h-8 w-8" />
            <span>AURA</span>
          </h1>
          <p className="text-text-secondary mt-2">AI-Powered Personal Stylist</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-accent-secondary/30 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-accent-secondary/30 rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          {error && <div className="bg-red-900/20 border border-red-800/50 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-primary hover:bg-accent-primary/90 text-background font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text-secondary text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent-primary hover:text-accent-primary/80 font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
