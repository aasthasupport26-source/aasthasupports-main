import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { captureMessage } from "@/lib/sentry";

const CSPReportSchema = z.object({
  "csp-report": z.object({
    "document-uri": z.string(),
    "violated-directive": z.string(),
    "blocked-uri": z.string().optional(),
    "source-file": z.string().optional(),
    "line-number": z.number().optional(),
    "column-number": z.number().optional(),
  }),
});

export const POST = createServerFn({ method: "POST" })
  .validator(CSPReportSchema)
  .handler(async ({ data }) => {
    const report = data["csp-report"];
    
    // Log CSP violation to monitoring
    captureMessage("CSP Violation", "warning", {
      documentUri: report["document-uri"],
      violatedDirective: report["violated-directive"],
      blockedUri: report["blocked-uri"],
      sourceFile: report["source-file"],
      lineNumber: report["line-number"],
      columnNumber: report["column-number"],
    });

    return new Response("OK", { status: 204 });
  });
