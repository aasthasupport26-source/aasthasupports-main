import { createContext, useContext, useState, useEffect, ReactNode, useRef, useMemo, useCallback } from "react";
import { verifyAccessToken } from "@/lib/auth.functions";
import { checkIsAdmin, revokeAdminTokenFn } from "@/lib/admin-auth.functions";
import { getSession, setSession, clearSession } from "@/lib/session.functions";
import { useServerFn } from "@tanstack/react-start";

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
  const initRef = useRef(false);
  const getSessionFn = useServerFn(getSession);
  const checkAdmin = useServerFn(checkIsAdmin);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    
    getSessionFn()
      .then((session) => {
        if (session) {
          setCustomer({
            id: session.customerId,
            email: session.email,
            firstName: session.firstName,
            lastName: session.lastName,
            phone: session.phone,
            displayName: session.displayName,
          });
          setAccessToken(session.accessToken);
          setIsAdmin(session.isAdmin);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const setSessionFn = useServerFn(setSession);

  const login = useCallback(async (
    customer: ShopifyCustomer,
    token: string,
    expiresAt?: string,
  ): Promise<boolean> => {
    const defaultExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const finalExpires = expiresAt || defaultExpiry;

    try {
      const adminResult = await checkAdmin({ data: { email: customer.email } });
      const isAdminUser = adminResult.isAdmin;

      await setSessionFn({
        data: {
          customerId: customer.id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          displayName: customer.displayName,
          accessToken: token,
          isAdmin: isAdminUser,
          expiresAt: finalExpires,
        },
      });

      setCustomer(customer);
      setAccessToken(token);
      setIsAdmin(isAdminUser);
      return isAdminUser;
    } catch {
      setIsAdmin(false);
      return false;
    }
  }, [checkAdmin, setSessionFn]);

  const clearSessionFn = useServerFn(clearSession);
  const revokeAdminToken = useServerFn(revokeAdminTokenFn);

  const logout = useCallback(async () => {
    if (accessToken && isAdmin) {
      try {
        await revokeAdminToken({ data: { token: accessToken } });
      } catch (error) {
        console.error("Failed to revoke admin token:", error);
      }
    }
    clearSessionFn();
    setCustomer(null);
    setAccessToken(null);
    setIsAdmin(false);
  }, [clearSessionFn, accessToken, isAdmin]);

  const value = useMemo(
    () => ({ customer, accessToken, loading, isAdmin, login, logout }),
    [customer, accessToken, loading, isAdmin, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
