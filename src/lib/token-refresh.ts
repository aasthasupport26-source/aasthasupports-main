import { supabaseAdmin } from "./auth/shopify-customer";

const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000;

/**
 * Revoke all tokens for a specific user
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin.auth.admin.signOut(userId);
    if (error) throw error;
    
    await supabaseAdmin
      .from("revoked_tokens")
      .insert({ token_hash: userId, revoked_at: new Date().toISOString() });
  } catch (error) {
    console.error("Failed to revoke user tokens:", error);
    throw new Error("Failed to revoke user tokens");
  }
}

export async function refreshTokenIfNeeded(
  refreshToken: string,
  expiresAt: string
): Promise<{ accessToken: string; expiresAt: string; refreshToken: string } | null> {
  const expiryTime = new Date(expiresAt).getTime();
  const now = Date.now();
  
  if (expiryTime - now > TOKEN_REFRESH_THRESHOLD) {
    return null;
  }
  
  try {
    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken,
    });
    
    if (error || !data.session) {
      return null;
    }
    
    return {
      accessToken: data.session.access_token,
      expiresAt: new Date(data.session.expires_at! * 1000).toISOString(),
      refreshToken: data.session.refresh_token,
    };
  } catch {
    return null;
  }
}

export function scheduleTokenRefresh(
  expiresAt: string,
  onRefresh: (token: string, expiresAt: string, refreshToken: string) => void
): () => void {
  const expiryTime = new Date(expiresAt).getTime();
  const refreshTime = expiryTime - TOKEN_REFRESH_THRESHOLD;
  const delay = Math.max(0, refreshTime - Date.now());
  
  const timeoutId = setTimeout(async () => {
    // Note: Token retrieval should be from httpOnly cookies via server endpoint
    // This localStorage access is deprecated and should be removed
    const currentToken = localStorage.getItem("aastha_access_token");
    const currentExpiry = localStorage.getItem("aastha_token_expires");
    const currentRefresh = localStorage.getItem("aastha_refresh_token");
    
    if (!currentRefresh || !currentExpiry) return;
    
    const result = await refreshTokenIfNeeded(currentRefresh, currentExpiry);
    if (result) {
      onRefresh(result.accessToken, result.expiresAt, result.refreshToken);
    }
  }, delay);
  
  return () => clearTimeout(timeoutId);
}
