import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
import { generateCSRFToken } from "./csrf-protection";

export const getCSRFToken = createServerFn({ method: "GET" }).handler(async () => {
  const token = generateCSRFToken();
  
  const isProd = process.env.NODE_ENV === "production";
  
  setCookie("csrf_token", token, {
    httpOnly: false,
    secure: isProd,
    sameSite: "strict",
    maxAge: 3600,
    path: "/",
  });

  return { token };
});
