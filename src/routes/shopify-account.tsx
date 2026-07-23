import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/shopify-account')({
  component: ShopifyAccountRedirect,
});

/**
 * Redirects to Shopify's official customer account dashboard
 * Use this link when you want customers to access their full Shopify account
 */
function ShopifyAccountRedirect() {
  useEffect(() => {
    window.location.href = 'https://shopify.com/101228675360/account';
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting to your account...</p>
      </div>
    </div>
  );
}
