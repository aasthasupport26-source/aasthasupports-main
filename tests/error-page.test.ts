import { describe, it, expect } from "vitest";
import { renderErrorPage } from "../src/lib/error-page";

describe("renderErrorPage", () => {
  it("should return valid HTML", () => {
    const html = renderErrorPage();
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("<html");
    expect(html).toContain("</html>");
  });

  it("should include error message", () => {
    const html = renderErrorPage();
    expect(html).toContain("This page didn't load");
    expect(html).toContain("Something went wrong");
  });

  it("should include action buttons", () => {
    const html = renderErrorPage();
    expect(html).toContain("Try again");
    expect(html).toContain("Go home");
    expect(html).toContain('onclick="location.reload()"');
    expect(html).toContain('href="/"');
  });

  it("should include viewport meta tag", () => {
    const html = renderErrorPage();
    expect(html).toContain('name="viewport"');
  });

  it("should include inline styles", () => {
    const html = renderErrorPage();
    expect(html).toContain("<style>");
    expect(html).toContain("</style>");
  });
});
