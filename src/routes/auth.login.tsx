import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { getShopifyOAuthUrl } from '@/lib/auth.functions';
import { useServerFn } from '@tanstack/react-start';
import { Loader2 } from 'lucide-react';
import { Layout } from '@/components/Layout';

export const Route = createFileRoute('/auth/login')({
  component: AuthLoginPage,
});

function AuthLoginPage() {
  const getOAuthUrl = useServerFn(getShopifyOAuthUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initOAuth = async () => {
      try {
        const redirectUri = `${window.location.origin}/auth/callback`;
        const res = await getOAuthUrl({ data: { redirectUri } });

        if (res?.authorizeUrl) {
          sessionStorage.setItem('shopify_pkce_verifier', res.verifier);
          sessionStorage.setItem('shopify_oauth_state', res.state);
          window.location.href = res.authorizeUrl;
        } else {
          throw new Error('Failed to obtain authorization URL');
        }
      } catch (err: any) {
        console.error('OAuth Login init error:', err);
        setError(err?.message || 'Failed to initiate login');
      }
    };

    initOAuth();
  }, [getOAuthUrl]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 text-center">
        {error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 max-w-md mx-auto">
            <h2 className="font-display text-xl mb-2">Login Error</h2>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            <Loader2 className="w-10 h-10 animate-spin text-maroon mb-4" />
            <h1 className="font-display text-2xl text-maroon-deep mb-2">Redirecting to Secure Login...</h1>
            <p className="text-sm text-muted-foreground">Connecting with Shopify Customer Accounts</p>
          </>
        )}
      </div>
    </Layout>
  );
}
