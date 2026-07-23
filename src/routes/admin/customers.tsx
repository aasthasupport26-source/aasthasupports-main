import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getAdminCustomers, deleteCustomer } from '@/lib/admin.functions';
import { Loader2, Search, Trash2, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/customers')({
  component: AdminCustomers,
});

function AdminCustomers() {
  const { customer, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const getCustomers = useServerFn(getAdminCustomers);
  const deleteCustomerFn = useServerFn(deleteCustomer);

  const { data: customers = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => getCustomers({ data: {} }),
    enabled: !!customer && isAdmin,
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-maroon" />
        </div>
      </Layout>
    );
  }

  if (!customer || !isAdmin) {
    return <Navigate to="/auth" />;
  }

  const filteredCustomers = customers.filter((c: any) => {
    const query = searchQuery.toLowerCase();
    return (
      c.email?.toLowerCase().includes(query) ||
      c.full_name?.toLowerCase().includes(query) ||
      c.phone?.includes(query)
    );
  });

  const handleDelete = async (email: string) => {
    if (!confirm(`Delete customer ${email}? This cannot be undone.`)) return;

    try {
      await deleteCustomerFn({ data: { email } });
      toast.success('Customer deleted');
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete customer');
    }
  };

  return (
    <Layout>
      <section className="container mx-auto py-12">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-maroon-deep mb-2">Customer Management</h1>
          <p className="text-muted-foreground">View and manage all registered customers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gold/20 p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-maroon" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? 'No customers matching your search' : 'No customers yet'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Joined</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c: any) => (
                    <tr key={c.email} className="border-b border-gray-100 hover:bg-cream/30 transition">
                      <td className="py-4 px-4">
                        <div className="font-medium text-sm">{c.full_name || '—'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {c.email}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm font-numeric">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {c.phone || '—'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-numeric">
                          <Calendar className="h-3 w-3" />
                          {new Date(c.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(c.email)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-numeric">
                Total Customers: <span className="font-semibold text-maroon-deep">{filteredCustomers.length}</span>
              </span>
              <Button variant="outline" onClick={() => navigate({ to: '/admin' })}>
                Back to Admin
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
