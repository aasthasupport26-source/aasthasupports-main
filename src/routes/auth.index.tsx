import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { loginUser, getShopifyOAuthUrl } from '@/lib/auth.functions';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Route = createFileRoute('/auth/')({
  head: () => ({
    meta: [
      { title: 'Sign In — Aastha Support' },
      { name: 'description', content: 'Sign in to access your Aastha Support account.' },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { email?: string } => {
    return {
      email: search.email as string | undefined,
    };
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const login = useServerFn(loginUser);
  const getOAuthUrl = useServerFn(getShopifyOAuthUrl);
  const { login: setAuthLogin } = useAuth();
  const search = Route.useSearch();

  const [email, setEmail] = useState(search.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const redirectUri = import.meta.env.VITE_SHOPIFY_REDIRECT_URI || `${window.location.origin}/auth/callback`;
      const res = await getOAuthUrl({ data: { redirectUri } });

      if (res?.authorizeUrl) {
        sessionStorage.setItem('shopify_pkce_verifier', res.verifier);
        sessionStorage.setItem('shopify_oauth_state', res.state);
        window.location.href = res.authorizeUrl;
      } else {
        throw new Error('Failed to obtain authorization URL');
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      toast.error(err?.message || 'Failed to start Google login');
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Enter a valid email address');
      return;
    }

    if (!password || password.length === 0) {
      toast.error('Password is required');
      return;
    }

    setLoading(true);
    try {
      const result = await login({ data: { email, password } });
      const isAdminUser = await setAuthLogin(result.customer, result.accessToken, result.expiresAt);

      toast.success(isAdminUser ? 'Welcome, Admin!' : 'Welcome back!');
      if (isAdminUser) {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/profile' });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="container max-w-md mx-auto py-20">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gold/20">
          <h1 className="font-display text-3xl text-maroon-deep mb-2 text-center">
            Welcome
          </h1>
          <p className="text-sm text-muted-foreground mb-8 text-center">
            Sign in to book poojas and manage your orders
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-muted-foreground text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
            <p className="text-xs text-maroon-deep text-center mt-2">
              New users: Click "Google" above to create an account instantly, then return here to sign in with your email
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
