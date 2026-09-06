import { supabase } from "./src/integrations/supabase/client";

async function main() {
  const { data, error } = await supabase.from("users").select("*").limit(5);
  console.log("Users:", data);
  if (error) console.error("Error:", error);
}
main();
