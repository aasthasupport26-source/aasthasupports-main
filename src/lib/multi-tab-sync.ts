const STORAGE_KEY = "auth_sync";
const SYNC_INTERVAL = 1000;

interface AuthSyncData {
  customer: any;
  accessToken: string | null;
  expiresAt: string | null;
  timestamp: number;
}

export function initAuthSync(
  onSync: (data: AuthSyncData) => void
): () => void {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === "aastha_access_token" || e.key === "aastha_customer") {
      const customer = localStorage.getItem("aastha_customer");
      const token = localStorage.getItem("aastha_access_token");
      const expires = localStorage.getItem("aastha_token_expires");
      
      onSync({
        customer: customer ? JSON.parse(customer) : null,
        accessToken: token,
        expiresAt: expires,
        timestamp: Date.now(),
      });
    }
  };

  const intervalId = setInterval(() => {
    const syncData = localStorage.getItem(STORAGE_KEY);
    if (syncData) {
      try {
        const data: AuthSyncData = JSON.parse(syncData);
        if (Date.now() - data.timestamp < 5000) {
          onSync(data);
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (err) {
        console.error('Auth sync data parsing failed:', err instanceof Error ? err.message : 'Invalid sync data');
      }
    }
  }, SYNC_INTERVAL);

  window.addEventListener("storage", handleStorageChange);

  return () => {
    clearInterval(intervalId);
    window.removeEventListener("storage", handleStorageChange);
  };
}

export function broadcastAuthChange(data: AuthSyncData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ...data,
    timestamp: Date.now(),
  }));
}
