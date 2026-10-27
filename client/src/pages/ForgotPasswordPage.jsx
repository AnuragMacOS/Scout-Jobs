import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, CheckCircle2, KeyRound, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { forgotPassword } from '../api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await forgotPassword(email);
      setSuccessData(data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Unable to process password reset. Please check your email and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-white dark:bg-[#0c0d12] transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
        {/* Brand Icon & Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-border dark:border-zinc-700 mb-3 text-blue-600 dark:text-blue-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white">
            Reset your password
          </h1>
          <p className="text-xs text-ink-muted dark:text-zinc-400 mt-1.5 leading-relaxed">
            Enter your registered college or campus email address to reset your account password.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successData ? (
          <div className="space-y-5">
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
                  Reset link generated successfully!
                </p>
                <p className="text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  A secure 15-minute reset session has been issued for{' '}
                  <span className="font-medium underline">{successData.email}</span>.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
              className="w-full"
              onClick={() => {
                navigate(`/reset-password?token=${encodeURIComponent(successData.resetToken)}`);
              }}
            >
              Set New Password Now
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-ink-muted dark:text-zinc-400 hover:text-ink dark:hover:text-white font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to sign in</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Registered Email *"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              helperText="We'll verify your registered account and prepare your password reset."
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
              Continue to password reset
            </Button>

            <div className="mt-6 pt-5 border-t border-border dark:border-zinc-800 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-ink-muted dark:text-zinc-400 hover:text-ink dark:hover:text-white font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
