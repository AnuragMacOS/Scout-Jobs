import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { verifyResetToken, resetPassword } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [verifying, setVerifying] = useState(() => !!token);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState(() =>
    token ? '' : 'No password reset token was provided in the link.'
  );
  const [userEmail, setUserEmail] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;

    async function checkToken() {
      try {
        const res = await verifyResetToken(token);
        if (res.valid) {
          setTokenValid(true);
          setUserEmail(res.email || '');
        } else {
          setTokenValid(false);
          setTokenError('This reset link has expired or is invalid.');
        }
      } catch (err) {
        setTokenValid(false);
        setTokenError(
          err.response?.data?.error ||
            'This reset link has expired or has already been used. Please request a new one.'
        );
      } finally {
        setVerifying(false);
      }
    }

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (newPassword.length < 8) {
      setSubmitError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitError('Passwords do not match. Please verify and try again.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({ token, newPassword });
      setIsSuccess(true);
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      setSubmitError(
        err.response?.data?.error ||
          'Failed to update password. Your reset link may have expired.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-white dark:bg-[#0c0d12] transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-border dark:border-zinc-700 mb-3 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-white">
            Set new password
          </h1>
          <p className="text-xs text-ink-muted dark:text-zinc-400 mt-1.5 leading-relaxed">
            {userEmail ? (
              <>
                Updating password for <span className="font-semibold text-ink dark:text-zinc-100">{userEmail}</span>
              </>
            ) : (
              'Enter and confirm your new secure account password.'
            )}
          </p>
        </div>

        {verifying && (
          <div className="py-8 text-center text-xs text-ink-muted dark:text-zinc-400 space-y-2">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p>Verifying secure reset token...</p>
          </div>
        )}

        {!verifying && !tokenValid && (
          <div className="space-y-5">
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-900 mb-1">Invalid or Expired Link</p>
                <p className="text-rose-700 leading-relaxed">{tokenError}</p>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => navigate('/forgot-password')}
            >
              Request a new reset link
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to sign in</span>
              </Link>
            </div>
          </div>
        )}

        {!verifying && tokenValid && isSuccess && (
          <div className="space-y-5 text-center">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3 text-left">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-900 mb-1">Password updated successfully!</p>
                <p className="text-emerald-700 leading-relaxed">
                  Your new credentials are now active. You have been authenticated and can proceed to your placement dashboard.
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
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        )}

        {!verifying && tokenValid && !isSuccess && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  New Password *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-ink-muted hover:text-ink inline-flex items-center gap-1"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Show
                    </>
                  )}
                </button>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                icon={Lock}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                Confirm New Password *
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                icon={Lock}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="p-3 bg-slate-50 border border-border rounded-lg text-xs space-y-1 text-ink-muted">
              <p className="font-semibold text-ink">Password Requirements:</p>
              <p className={`flex items-center gap-1.5 ${newPassword.length >= 8 ? 'text-emerald-600 font-medium' : ''}`}>
                <span>{newPassword.length >= 8 ? '✓' : '•'}</span> Minimum 8 characters
              </p>
              <p className={`flex items-center gap-1.5 ${newPassword && newPassword === confirmPassword ? 'text-emerald-600 font-medium' : ''}`}>
                <span>{newPassword && newPassword === confirmPassword ? '✓' : '•'}</span> Passwords match
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full mt-2"
            >
              Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
