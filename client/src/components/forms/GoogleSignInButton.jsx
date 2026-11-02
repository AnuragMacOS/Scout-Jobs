import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const FALLBACK_CLIENT_ID = '208752939818-geb0b1m1p9inj7ntgbm7s6ehgdgaquji.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || FALLBACK_CLIENT_ID;

export default function GoogleSignInButton({
  text = 'continue_with',
  from = '/dashboard',
  onError,
  className = '',
}) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleClick = () => {
    setErrorMessage('');
    if (onError) onError('');

    if (!GOOGLE_CLIENT_ID) {
      const msg = 'Google Client ID is missing. Please check your configuration.';
      setErrorMessage(msg);
      if (onError) onError(msg);
      return;
    }

    try {
      setIsRedirecting(true);

      // Use current window origin as redirect URI (authorized in Google Cloud Console)
      const redirectUri = window.location.origin;

      const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      url.searchParams.set('client_id', GOOGLE_CLIENT_ID);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('response_type', 'id_token token');
      url.searchParams.set('scope', 'email profile openid');
      url.searchParams.set('prompt', 'select_account');
      url.searchParams.set('nonce', Math.random().toString(36).substring(2) + Date.now().toString(36));
      url.searchParams.set('state', JSON.stringify({ from: from || '/dashboard' }));

      // Standard browser navigation (bypasses all iframe issues, popup blockers, and canvas glitches)
      window.location.href = url.toString();
    } catch (err) {
      console.error('Failed to initiate Google OAuth redirect:', err);
      setIsRedirecting(false);
      const msg = 'Failed to open Google sign-in. Please try again.';
      setErrorMessage(msg);
      if (onError) onError(msg);
    }
  };

  const buttonLabel =
    text === 'signup_with'
      ? 'Sign up with Google'
      : text === 'signin_with'
      ? 'Sign in with Google'
      : 'Continue with Google';

  return (
    <div className={`w-full ${className}`}>
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={isRedirecting}
        className="w-full h-11 px-4 rounded-xl border border-border dark:border-[#232634] bg-white dark:bg-[#12141D] hover:bg-zinc-50 dark:hover:bg-[#171924] text-sm font-semibold text-zinc-800 dark:text-zinc-100 shadow-xs hover:shadow-sm transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group"
      >
        {isRedirecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Redirecting to Google...</span>
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-105"
              viewBox="0 0 24 24"
            >
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
            <span>{buttonLabel}</span>
          </>
        )}
      </button>

      {errorMessage && (
        <p className="mt-2 text-xs text-center text-rose-600 dark:text-rose-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
