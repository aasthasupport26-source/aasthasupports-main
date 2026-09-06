import { loginUser } from "./src/lib/auth.functions";

async function main() {
  try {
    const res = await loginUser({
      data: { email: "admin@example.com", password: "password" },
    } as any);
    console.log("Success:", res);
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
