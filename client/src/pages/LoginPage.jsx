import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import GoogleSignInButton from '../components/forms/GoogleSignInButton';

export default function LoginPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const from = location.state?.from?.pathname || redirectParam || '/';
  const isFromDashboard = from.includes('dashboard');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login({ email, password });
      if (res.user?.role === 'admin') {
        navigate('/admin/post-job', { replace: true });
      } else {
        navigate(from === '/' ? '/dashboard' : from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-white dark:bg-[#0c0d12] transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
        {/* Brand & Dynamic Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-border dark:border-zinc-700 mb-3">
            <img src="/logo.jpg" alt="Scout Logo" className="w-8 h-8 rounded-lg object-cover" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white">
            {isFromDashboard
              ? 'Please sign in to access your application dashboard'
              : 'Sign in to your account'}
          </h1>
          <p className="text-xs text-ink-muted dark:text-zinc-400 mt-1">
            {isFromDashboard
              ? 'Enter your email and password to view your applications.'
              : 'Access applications, resume profiles, and campus listings'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email *"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            required
            value={email}
            onChange={(e) => {
              if (error) setError('');
              setEmail(e.target.value);
            }}
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-zinc-400">
                Password *
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              icon={Lock}
              required
              value={password}
              onChange={(e) => {
                if (error) setError('');
                setPassword(e.target.value);
              }}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            icon={ArrowRight}
            iconPosition="right"
            className="w-full mt-2"
          >
            Sign in
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-[#151722] px-3 text-ink-muted dark:text-zinc-400 font-medium">
              or
            </span>
          </div>
        </div>

        <GoogleSignInButton
          text="continue_with"
          from={from}
          onError={(msg) => setError(msg)}
        />

        <div className="mt-6 pt-5 border-t border-border dark:border-zinc-800 text-center">
          <p className="text-xs text-ink-muted dark:text-zinc-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline ml-1"
            >
              Sign up →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
