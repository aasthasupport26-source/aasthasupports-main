import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch (err) {
    console.error('Failed to parse SSR error body:', err instanceof Error ? err.message : 'Unknown error');
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

import { handleRazorpayPujaWebhook } from "./server/webhooks/razorpay-puja";
import { applySecurityHeaders } from "./lib/security-headers";
import { validateCSRF } from "./lib/csrf-protection";

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      
      // Check request body size (10MB limit)
      const contentLength = request.headers.get("content-length");
      if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
        return applySecurityHeaders(
          new Response("Request body too large", { status: 413 })
        );
      }
      
      // Apply global rate limiting
      const { checkRateLimit } = await import("./lib/rate-limit");
      const rateCheck = checkRateLimit(request, "global");
      if (!rateCheck.allowed) {
        return applySecurityHeaders(
          new Response("Rate limit exceeded", { status: 429 })
        );
      }

      // Skip CSRF for webhooks (they use signature verification)
      const isWebhook = url.pathname.startsWith("/api/webhooks/");
      
      // Apply CSRF protection to state-changing requests
      if (!isWebhook && ["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
        try {
          validateCSRF(request);
        } catch (csrfError) {
          return applySecurityHeaders(
            new Response("CSRF validation failed", { status: 403 })
          );
        }
      }

      // Intercept webhooks before passing to TanStack Start
      if (request.method === "POST") {
        if (url.pathname === "/api/webhooks/razorpay-puja") {
          const webhookResponse = await handleRazorpayPujaWebhook(request);
          return applySecurityHeaders(webhookResponse);
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalizedResponse = await normalizeCatastrophicSsrResponse(response);
      return applySecurityHeaders(normalizedResponse);
    } catch (error) {
      console.error(error);
      const errorResponse = brandedErrorResponse();
      return applySecurityHeaders(errorResponse);
    }
  },
};
