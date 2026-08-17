import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getCSRFToken } from "@/lib/csrf.functions";

export function useCSRF() {
  const [token, setToken] = useState<string>("");
  const fetchToken = useServerFn(getCSRFToken);

  useEffect(() => {
    fetchToken().then((result) => setToken(result.token));
  }, []);

  return token;
}

export function getCSRFHeaders(token: string): Record<string, string> {
  return token ? { "x-csrf-token": token } : {};
}
