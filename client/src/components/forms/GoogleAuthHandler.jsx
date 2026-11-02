import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../ui/Toast';
import { Loader2 } from 'lucide-react';

export default function GoogleAuthHandler() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || (!hash.includes('access_token=') && !hash.includes('id_token='))) {
      return;
    }

    const hashParams = new URLSearchParams(hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const idToken = hashParams.get('id_token');
    const stateStr = hashParams.get('state');

    let targetFrom = '/dashboard';
    try {
      if (stateStr) {
        const parsed = JSON.parse(stateStr);
        if (parsed.from) targetFrom = parsed.from;
      }
    } catch {}

    // Clean hash from browser address bar immediately so tokens are not exposed
    window.history.replaceState(null, '', window.location.pathname + window.location.search);

    if (!accessToken && !idToken) return;

    setIsProcessing(true);

    loginWithGoogle({ credential: idToken, access_token: accessToken })
      .then((res) => {
        showToast('Signed in with Google successfully!', 'success');
        if (res.user?.role === 'admin') {
          navigate('/admin/post-job', { replace: true });
        } else {
          navigate(targetFrom === '/' ? '/dashboard' : targetFrom, { replace: true });
        }
      })
      .catch((err) => {
        console.error('Google OAuth redirect error:', err);
        const msg = err.response?.data?.error || 'Failed to authenticate with Google. Please try again.';
        showToast(msg, 'error');
        navigate('/login', { replace: true });
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }, [loginWithGoogle, navigate, showToast]);

  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 dark:bg-[#0c0d12]/90 backdrop-blur-xs">
      <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white dark:bg-[#12141D] border border-border dark:border-[#232634] shadow-elevated">
        <Loader2 className="w-7 h-7 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Authenticating with Google...
        </p>
      </div>
    </div>
  );
}
