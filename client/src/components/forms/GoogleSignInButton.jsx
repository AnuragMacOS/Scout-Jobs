import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleSignInButton({
  text = 'continue_with',
  from = '/dashboard',
  onError,
  className = '',
}) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const hasInitializedRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCredentialResponse = useCallback(
    async (response) => {
      if (!response || !response.credential) {
        const msg = 'Google authentication response was missing credentials.';
        setErrorMessage(msg);
        if (onError) onError(msg);
        return;
      }

      setIsAuthenticating(true);
      setErrorMessage('');
      if (onError) onError('');

      try {
        const res = await loginWithGoogle({ credential: response.credential });
        if (res.user?.role === 'admin') {
          navigate('/admin/post-job', { replace: true });
        } else {
          navigate(from === '/' ? '/dashboard' : from, { replace: true });
        }
      } catch (err) {
        console.error('Google sign-in error:', err);
        const msg =
          err.response?.data?.error ||
          'Failed to sign in with Google. Please try again or use your password.';
        setErrorMessage(msg);
        if (onError) onError(msg);
      } finally {
        setIsAuthenticating(false);
      }
    },
    [loginWithGoogle, navigate, from, onError]
  );

  const renderGoogleButton = useCallback(() => {
    if (!buttonRef.current || !window.google?.accounts?.id || !GOOGLE_CLIENT_ID) {
      return false;
    }

    try {
      const isDark = document.documentElement.classList.contains('dark');
      const containerWidth = containerRef.current?.offsetWidth || 384;
      const targetWidth = Math.min(400, Math.max(200, Math.floor(containerWidth)));

      if (!hasInitializedRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        hasInitializedRef.current = true;
      }

      // Clear any prior rendered button (e.g., when theme changes)
      buttonRef.current.innerHTML = '';

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: isDark ? 'filled_black' : 'outline',
        size: 'large',
        text: text, // 'continue_with' | 'signup_with' | 'signin_with'
        shape: 'rectangular',
        logo_alignment: 'left',
        width: targetWidth,
      });

      setIsLoaded(true);
      return true;
    } catch (e) {
      console.error('[Google GIS render error]', e);
      return false;
    }
  }, [handleCredentialResponse, text]);

  // Initial load and script polling
  useEffect(() => {
    if (renderGoogleButton()) return;

    const interval = setInterval(() => {
      if (renderGoogleButton()) {
        clearInterval(interval);
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [renderGoogleButton]);

  // Re-render when theme (dark/light) changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      renderGoogleButton();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [renderGoogleButton]);

  // Re-render if container size changes (e.g. mobile rotation or resize)
  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === 'undefined') return;

    let timer;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        renderGoogleButton();
      }, 150);
    });

    resizeObserver.observe(containerRef.current);
    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [renderGoogleButton]);

  const buttonLabel =
    text === 'signup_with'
      ? 'Sign up with Google'
      : text === 'signin_with'
      ? 'Sign in with Google'
      : 'Continue with Google';

  return (
    <div className={`w-full ${className}`}>
      {isAuthenticating ? (
        <div className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-border dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm font-medium text-ink dark:text-zinc-200">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
          <span>Signing in with Google...</span>
        </div>
      ) : (
        <div ref={containerRef} className="w-full flex justify-center min-h-[44px]">
          {/* Official Google button renders here */}
          <div
            ref={buttonRef}
            className={`flex justify-center w-full ${!isLoaded ? 'hidden' : ''}`}
          />

          {/* Placeholder while Google Identity Services script loads */}
          {!isLoaded && (
            <div className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-border dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium text-ink dark:text-zinc-200 shadow-xs">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            </div>
          )}
        </div>
      )}

      {errorMessage && !onError && (
        <p className="mt-2 text-xs text-center text-rose-600 dark:text-rose-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
