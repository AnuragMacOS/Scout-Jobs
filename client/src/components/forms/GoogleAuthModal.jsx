import React, { useState } from 'react';
import { X, ArrowRight, User, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function GoogleAuthModal({ isOpen, onClose, from = '/dashboard' }) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectAccount = async (email, name = '') => {
    setError('');
    setLoadingEmail(email);
    try {
      const res = await loginWithGoogle({ email, name });
      onClose();
      if (res.user?.role === 'admin') {
        navigate('/admin/post-job', { replace: true });
      } else {
        navigate(from === '/' ? '/dashboard' : from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to authenticate with Google account.');
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-[#151722] rounded-2xl shadow-2xl border border-border dark:border-zinc-800 overflow-hidden text-ink dark:text-zinc-100">
        {/* Header */}
        <div className="p-5 border-b border-border dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <div>
              <h3 className="text-sm font-bold text-ink dark:text-white leading-tight">Sign in with Google</h3>
              <p className="text-[11px] text-ink-muted dark:text-zinc-400 leading-none">Choose an account to continue</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-ink-muted dark:text-zinc-400 hover:text-ink dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Account options */}
        <div className="p-4 space-y-2">
          {/* Default Anurag Bhatt Account */}
          <button
            type="button"
            onClick={() => handleSelectAccount('anurag23_it183@dtu.ac.in', 'Anurag Bhatt')}
            disabled={!!loadingEmail}
            className="w-full text-left p-3 rounded-xl border border-border dark:border-zinc-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                A
              </div>
              <div>
                <p className="text-sm font-bold text-ink dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Anurag Bhatt
                </p>
                <p className="text-xs text-ink-muted dark:text-zinc-400">anurag23_it183@dtu.ac.in</p>
              </div>
            </div>
            {loadingEmail === 'anurag23_it183@dtu.ac.in' ? (
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 text-ink-muted dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            )}
          </button>

          {/* Custom Google Account */}
          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="w-full text-left p-3 rounded-xl border border-dashed border-border dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-3 text-ink-muted dark:text-zinc-400 hover:text-ink dark:hover:text-zinc-100 text-xs font-medium cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 text-ink-muted dark:text-zinc-400 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <span>Use another Google account</span>
            </button>
          ) : (
            <div className="p-3.5 rounded-xl border border-border dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-900/70 space-y-2.5">
              <div className="text-xs font-semibold text-ink dark:text-white">Enter your Google Email:</div>
              <input
                type="email"
                placeholder="you@gmail.com or @college.edu"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full rounded-md border border-border dark:border-zinc-700 text-xs px-3 py-2 bg-white dark:bg-zinc-950 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="flex-1 py-1.5 px-3 rounded-md border border-border dark:border-zinc-700 text-xs font-medium text-ink dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!customEmail || !!loadingEmail}
                  onClick={() => handleSelectAccount(customEmail)}
                  className="flex-1 py-1.5 px-3 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {loadingEmail === customEmail ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer disclaimer */}
        <div className="px-5 py-3 bg-slate-50/70 dark:bg-zinc-900/70 border-t border-border dark:border-zinc-800 text-[11px] text-ink-muted dark:text-zinc-400 leading-relaxed">
          Google Workspace OAuth integration connects directly to Scout's secure placement session.
        </div>
      </div>
    </div>
  );
}
