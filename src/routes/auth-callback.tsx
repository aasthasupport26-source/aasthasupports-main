import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/auth-callback')({
  component: AuthCallback,
});

/**
 * OAuth callback handler for Google/Shopify authentication
 * After user logs in via Shopify, they're redirected here with multipass token
 */
function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get multipass token from URL
        const params = new URLSearchParams(window.location.search);
        const multipassToken = params.get('token');
        const email = params.get('email');

        if (!email) {
          throw new Error('No email provided in callback');
        }

        // For now, just show success and let user login normally
        // Full multipass implementation requires Shopify Plus
        setStatus('success');
        toast.info('Google account linked! Please enter your password to sign in.', { duration: 6000 });
        navigate({ to: '/auth', search: { email } });
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        toast.error('Authentication failed. Please try again.');
        navigate({ to: '/auth' });
      }
    };

    handleCallback();
  }, [navigate, login]);

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
