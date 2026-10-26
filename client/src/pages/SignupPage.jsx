import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import GoogleAuthModal from '../components/forms/GoogleAuthModal';

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
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
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
            label="College Email *"
            name="email"
            type="email"
            placeholder="student@college.edu"
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
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#151722] px-2 text-ink-muted dark:text-zinc-400 font-medium">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsGoogleModalOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-border dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-sm font-medium text-ink dark:text-zinc-100 transition-colors shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign up with Google</span>
        </button>

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

      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
      />
    </div>
  );
}
