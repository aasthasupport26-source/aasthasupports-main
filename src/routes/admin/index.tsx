import { createFileRoute, Navigate, Link } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Calendar, Package, Settings } from 'lucide-react';

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { customer, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon"></div>
      </div>
    );
  }

  if (!customer || !isAdmin) {
    return <Navigate to="/auth" />;
  }

  const adminSections = [
    {
      title: 'Customer Management',
      description: 'View, search, and manage customer accounts',
      icon: Users,
      href: '/admin/customers',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Booking Management',
      description: 'View and update booking statuses',
      icon: Calendar,
      href: '/admin/bookings',
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Pooja Management',
      description: 'Manage pooja offerings and pricing',
      icon: Package,
      href: '/admin/poojas',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Settings',
      description: 'System configuration and preferences',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-50 text-gray-600',
    },
  ];

  return (
    <div className="py-4">
      <section className="container mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-maroon-deep mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Administrator</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.href}
                to={section.href}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gold/20 hover:shadow-xl transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${section.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl text-maroon-deep mb-1">
                      {section.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 bg-cream rounded-xl p-6 border border-gold/20">
          <h3 className="font-display text-lg text-maroon-deep mb-2">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-numeric font-bold text-maroon-deep mt-1">—</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Active Bookings</p>
              <p className="text-2xl font-numeric font-bold text-maroon-deep mt-1">—</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-numeric font-bold text-maroon-deep mt-1">—</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-numeric font-bold text-maroon-deep mt-1">—</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
