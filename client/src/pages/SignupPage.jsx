import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import GoogleSignInButton from '../components/forms/GoogleSignInButton';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    rollNo: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (error) setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-white dark:bg-[#0c0d12] transition-colors">
      <div className="w-full max-w-lg bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 rounded-2xl p-8 shadow-card">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-border dark:border-zinc-700 mb-3">
            <img src="/logo.jpg" alt="Scout Logo" className="w-8 h-8 rounded-lg object-cover" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white">
            Create student account
          </h1>
          <p className="text-xs text-ink-muted dark:text-zinc-400 mt-1">
            Sign up with your college roll number to apply for jobs
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name *"
              name="firstName"
              placeholder=""
              required
              value={formData.firstName}
              onChange={handleChange}
            />
            <Input
              label="Last Name *"
              name="lastName"
              placeholder=""
              required
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Email *"
            name="email"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            required
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            label="Roll Number *"
            name="rollNo"
            placeholder="e.g. 23/CS/054"
            required
            value={formData.rollNo}
            onChange={handleChange}
          />

          <Input
            label="Password *"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            icon={Lock}
            required
            minLength={8}
            helperText="Minimum 8 characters"
            value={formData.password}
            onChange={handleChange}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            icon={ArrowRight}
            iconPosition="right"
            className="w-full mt-2"
          >
            Create account
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
          text="signup_with"
          from="/"
          onError={(msg) => setError(msg)}
        />

        <div className="mt-6 pt-5 border-t border-border dark:border-zinc-800 text-center">
          <p className="text-xs text-ink-muted dark:text-zinc-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline ml-1"
            >
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
