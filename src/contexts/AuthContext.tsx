import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { verifyAccessToken } from '@/lib/auth.functions';
import { checkIsAdmin } from '@/lib/admin-auth.functions';
import { useServerFn } from '@tanstack/react-start';

interface ShopifyCustomer {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  displayName: string;
}

interface AuthContextType {
  customer: ShopifyCustomer | null;
  accessToken: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (customer: ShopifyCustomer, token: string, expiresAt: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<ShopifyCustomer | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const verify = useServerFn(verifyAccessToken);
  const checkAdmin = useServerFn(checkIsAdmin);

  useEffect(() => {
    const token = localStorage.getItem('aastha_access_token');
    const expires = localStorage.getItem('aastha_token_expires');
    const storedCustomer = localStorage.getItem('aastha_customer');

    if (token && expires && storedCustomer) {
      const expiresAt = new Date(expires);
      if (expiresAt > new Date()) {
        try {
          const parsedCustomer = JSON.parse(storedCustomer);
          setCustomer(parsedCustomer);
          setAccessToken(token);

          // Check admin status and wait before setting loading to false
          checkAdmin({ data: { email: parsedCustomer.email } })
            .then((result) => {
              setIsAdmin(result.isAdmin);
              setLoading(false);
            })
            .catch(() => {
              setIsAdmin(false);
              setLoading(false);
            });

          // Verification in background
          verify({ data: { accessToken: token } })
            .then((result) => setCustomer(result.customer))
            .catch((err) => {
              console.log('Background token verification failed, keeping cached session:', err);
              // Do NOT clear session or set customer to null; respect the cached credentials
            });
          return;
        } catch (e) {
          console.error('Failed to parse stored customer:', e);
        }
      }
    }

    // No valid token
    setLoading(false);
  }, []);

  const login = async (customer: ShopifyCustomer, token: string, expiresAt: string): Promise<boolean> => {
    setCustomer(customer);
    setAccessToken(token);
    localStorage.setItem('aastha_customer', JSON.stringify(customer));
    localStorage.setItem('aastha_access_token', token);
    localStorage.setItem('aastha_token_expires', expiresAt);

    // Check admin status
    try {
      const result = await checkAdmin({ data: { email: customer.email } });
      setIsAdmin(result.isAdmin);
      return result.isAdmin;
    } catch {
      setIsAdmin(false);
      return false;
    }
  };

  const logout = () => {
    setCustomer(null);
    setAccessToken(null);
    setIsAdmin(false);
    localStorage.removeItem('aastha_customer');
    localStorage.removeItem('aastha_access_token');
    localStorage.removeItem('aastha_token_expires');
  };

  return (
    <AuthContext.Provider value={{ customer, accessToken, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
