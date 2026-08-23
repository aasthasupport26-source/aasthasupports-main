import { supabaseAdmin } from "./auth/shopify-customer";

export async function withTransaction<T>(fn: (client: typeof supabaseAdmin) => Promise<T>): Promise<T> {
  const { data, error } = await supabaseAdmin.rpc('begin_transaction');
  if (error) throw new Error(`Failed to begin transaction: ${error.message}`);
  
  try {
    const result = await fn(supabaseAdmin);
    const { error: commitError } = await supabaseAdmin.rpc('commit_transaction');
    if (commitError) throw new Error(`Failed to commit transaction: ${commitError.message}`);
    return result;
  } catch (error) {
    const { error: rollbackError } = await supabaseAdmin.rpc('rollback_transaction');
    if (rollbackError) console.error("Rollback failed:", rollbackError);
    console.error("Transaction failed:", error);
    throw error;
  }
}
