import { createServerFn } from "@tanstack/react-start";
import { performHealthCheck, getLastHealthCheck } from "./monitoring";

export const healthCheck = createServerFn({ method: "GET" }).handler(async () => {
  const cached = getLastHealthCheck();
  if (cached && Date.now() - cached.timestamp < 30000) {
    return cached;
  }
  return performHealthCheck();
});
