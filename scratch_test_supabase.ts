import { createClient } from "@supabase/supabase-js";
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
async function run() {
  try {
    const res = await supabaseAdmin
      .from("users")
      .select("email")
      .eq("email", "nonexistent@admin.com")
      .single();
    console.log("Result", res);
  } catch (e) {
    console.error("Caught Exception:", e);
  }
}
run();
