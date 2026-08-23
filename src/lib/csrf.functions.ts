import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
export const getCSRFToken = createServerFn({ method: "GET" }).handler(async () => {
  const { generateCSRFToken } = await import("./csrf-protection");
  const token = generateCSRFToken();
  
  const isNode = typeof process !== "undefined";
  
  setCookie("csrf_token", token, {
    httpOnly: false, // Must be readable by client JS
    secure: isNode ? process.env.NODE_ENV === "production" : false,
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return { token };
});
