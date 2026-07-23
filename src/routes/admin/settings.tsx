import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';

export const Route = createFileRoute('/admin/settings')({
  component: AdminSettings,
});

function AdminSettings() {
  const { customer, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon"></div>
        </div>
      </Layout>
    );
  }

  if (!customer || !isAdmin) {
    return <Navigate to="/auth" />;
  }

  return (
    <Layout>
      <section className="container mx-auto py-12">
        <h1 className="font-display text-4xl text-maroon-deep mb-2">Settings</h1>
        <p className="text-muted-foreground">Coming soon</p>
      </section>
    </Layout>
  );
}
