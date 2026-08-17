import { createServerFn } from "@tanstack/react-start";
import { generateCSRFToken } from "./csrf-protection";
import { setCookie } from "@tanstack/react-start/server";

export const getCSRFToken = createServerFn({ method: "GET" }).handler(async () => {
  const token = generateCSRFToken();
  
  setCookie("csrf_token", token, {
    httpOnly: false, // Must be readable by client JS
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return { token };
});
