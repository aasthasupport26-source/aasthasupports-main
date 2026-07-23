import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { exchangeOAuthCode } from '@/lib/auth.functions';
import { useServerFn } from '@tanstack/react-start';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/auth-callback')({
  component: AuthCallback,
});

/**
 * OAuth callback handler for Google/Shopify authentication
 * Exchanges authorization code for tokens and redirects to /profile
 */
function AuthCallback() {
  const navigate = useNavigate();
  const { login: setAuthLogin } = useAuth();
  const exchangeCode = useServerFn(exchangeOAuthCode);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');

        if (!code) {
          throw new Error('No authorization code provided in URL');
        }

        const savedState = sessionStorage.getItem('shopify_oauth_state');
        const verifier = sessionStorage.getItem('shopify_pkce_verifier');

        if (savedState && state && savedState !== state) {
          throw new Error('State mismatch detected. Authentication aborted.');
        }

        if (!verifier) {
          throw new Error('PKCE verifier missing from session.');
        }

        const redirectUri = `${window.location.origin}/auth-callback`;
        const res = await exchangeCode({
          data: {
            code,
            verifier,
            redirectUri,
          },
        });

        sessionStorage.removeItem('shopify_pkce_verifier');
        sessionStorage.removeItem('shopify_oauth_state');

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
              <h1 className="font-display text-2xl text-maroon-deep mb-2">
                Completing sign in...
              </h1>
              <p className="text-sm text-muted-foreground">
                Please wait while we verify your account
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-display text-2xl text-maroon-deep mb-2">
                Authentication successful!
              </h1>
              <p className="text-sm text-muted-foreground">
                Redirecting you to sign in...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="font-display text-2xl text-maroon-deep mb-2">
                Something went wrong
              </h1>
              <p className="text-sm text-muted-foreground">
                Redirecting you back to login...
              </p>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
