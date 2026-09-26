import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { loginUser, getShopifyOAuthUrl } from "@/lib/auth.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [
      { title: "Sign In — Aastha Support" },
      { name: "description", content: "Sign in to access your Aastha Support account." },
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

  const [email, setEmail] = useState(search.email || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const redirectUri =
        import.meta.env.VITE_SHOPIFY_REDIRECT_URI || `${window.location.origin}/auth/callback`;
      const res = await getOAuthUrl({ data: { redirectUri } });

      if (res?.authorizeUrl) {
        window.location.href = res.authorizeUrl;
      } else {
        throw new Error("Failed to obtain authorization URL");
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      toast.error(err?.message || "Failed to start Google login");
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }

    if (!password || password.length === 0) {
      toast.error("Password is required");
      return;
    }

    setLoading(true);
    try {
      const result = await login({ data: { email, password } });
      const isAdminUser = await setAuthLogin(result.customer, result.accessToken, result.expiresAt);

      toast.success(isAdminUser ? "Welcome, Admin!" : "Welcome back!");
      if (isAdminUser) {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/my-account" });
      }
    } catch (err: any) {
      toast.error(err?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="container max-w-md mx-auto py-20">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gold/20">
          <h1 className="font-sans font-bold text-3xl text-maroon-deep mb-2 text-center">Welcome</h1>
          <p className="text-sm text-muted-foreground mb-8 text-center">
            Sign in to access your account and manage your orders
          </p>

          {/* Primary: Auth-based sign in via Shopify & Google */}
          <div className="space-y-3">
            <Button
              type="button"
              className="w-full h-12 bg-maroon hover:bg-maroon-deep text-white font-medium rounded-xl shadow-sm flex items-center justify-center gap-3 text-sm transition-all border border-gold/40"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connecting to secure login...</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.7 7.3l3.7 2.9C6.3 7.6 8.9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.4 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.7 6.3C.6 8.5 0 10.2 0 12s.6 3.5 1.7 5.7l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.7-2.1-6.6-5L1.7 16.2C3.5 20.4 7.4 23 12 23z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Secure one-click sign in and order tracking via Shopify & Google Accounts
            </p>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs">
                Email Address
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
              <Label htmlFor="password" className="text-xs">
                Password
              </Label>
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

            <Button type="submit" variant="outline" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In with Password"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-muted-foreground text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
