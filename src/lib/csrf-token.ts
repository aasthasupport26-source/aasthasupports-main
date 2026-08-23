import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
export const getCSRFToken = createServerFn({ method: "GET" }).handler(async () => {
  const { generateCSRFToken } = await import("./csrf-protection");
  const token = generateCSRFToken();
  
  const isNode = typeof process !== "undefined";
  const isProd = isNode ? process.env.NODE_ENV === "production" : false;
  
  setCookie("csrf_token", token, {
    httpOnly: false,
    secure: isProd,
    sameSite: "strict",
    maxAge: 3600,
    path: "/",
  });

  return { token };
});
