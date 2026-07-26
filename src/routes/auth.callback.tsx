import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { exchangeOAuthCode } from '@/lib/auth.functions';
import { useServerFn } from '@tanstack/react-start';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const { login: setAuthLogin } = useAuth();
  const exchangeCode = useServerFn(exchangeOAuthCode);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');

        if (!code) {
          throw new Error('No authorization code provided in URL');
        }

        const redirectUri = import.meta.env.VITE_SHOPIFY_REDIRECT_URI || `${window.location.origin}${window.location.pathname}`;
        const res = await exchangeCode({
          data: {
            code,
            state: state || '',
            redirectUri,
          },
        });

        const expiresAt = new Date(Date.now() + (res.expiresIn || 3600) * 1000).toISOString();
        const isAdmin = await setAuthLogin(res.customer, res.accessToken, expiresAt);

        setStatus('success');
        toast.success(isAdmin ? 'Welcome, Admin!' : 'Successfully signed in!');

        setTimeout(() => {
          navigate({ to: isAdmin ? '/admin' : '/profile' });
        }, 1000);
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        toast.error(error?.message || 'Authentication failed. Please try again.');
        setTimeout(() => {
          navigate({ to: '/auth' });
        }, 2000);
      }
    };

    handleCallback();
  }, [navigate, setAuthLogin, exchangeCode]);

  return (
    <Layout>
      <section className="container max-w-md mx-auto py-20">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gold/20 text-center">
          {status === 'processing' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-maroon mx-auto mb-4" />
              <h1 className="font-display text-2xl text-maroon-deep mb-2">Completing sign in...</h1>
              <p className="text-sm text-muted-foreground">Verifying your account with Shopify</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-display text-2xl text-maroon-deep mb-2">Authentication successful!</h1>
              <p className="text-sm text-muted-foreground">Redirecting to your account...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="font-display text-2xl text-maroon-deep mb-2">Authentication failed</h1>
              <p className="text-sm text-muted-foreground">Redirecting back to login...</p>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
