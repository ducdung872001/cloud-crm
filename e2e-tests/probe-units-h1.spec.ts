import { test } from "@playwright/test";

test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148 Safari/604.1",
});

test("inspect h1 on units page", async ({ page }) => {
  // Quick login
  await page.goto("https://tnpm.reborn.vn/crm/units", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => location.hostname.includes("sso.reborn.vn") && !!document.querySelector('input[type="password"]'), undefined, { timeout: 30000 }).catch(() => {});

  if (page.url().includes("sso.reborn.vn")) {
    await page.locator('input[type="text"], input[type="tel"]').first().fill("0971234599");
    await page.locator('input[type="password"]').first().fill("Reborn@12345");
    await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await page.waitForFunction(() => location.hostname.includes("tnpm.reborn.vn"), undefined, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(8000);
    await page.evaluate(() => document.querySelectorAll(".tour-tooltip, [class*='tour' i]").forEach((el) => el.remove()));
    const roleCard = page.locator('text="Ban giám đốc"').first();
    if (await roleCard.isVisible().catch(() => false)) {
      await roleCard.click({ force: true });
      await page.locator('button:has-text("Xác nhận")').first().click({ force: true });
      await page.waitForTimeout(8000);
    }
  }

  await page.goto("https://tnpm.reborn.vn/crm/units", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);

  // Inspect H1
  const inspect = await page.evaluate(() => {
    const h1 = document.querySelector(".page-title");
    if (!h1) return { found: false };
    const cs = getComputedStyle(h1);
    const rect = h1.getBoundingClientRect();
    return {
      found: true,
      text: h1.textContent,
      display: cs.display,
      visibility: cs.visibility,
      opacity: cs.opacity,
      fontSize: cs.fontSize,
      color: cs.color,
      bgColor: cs.backgroundColor,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      visible_in_viewport: rect.top < 844 && rect.bottom > 0,
    };
  });
  console.log("H1.page-title:", JSON.stringify(inspect, null, 2));

  // Render text + check parent chain
  const chain = await page.evaluate(() => {
    const h1 = document.querySelector(".page-title");
    if (!h1) return [];
    const out: any[] = [];
    let el: Element | null = h1;
    while (el && out.length < 8) {
      const cs = getComputedStyle(el);
      out.push({
        tag: el.tagName,
        cls: el.className,
        position: cs.position,
        zIndex: cs.zIndex,
        overflow: cs.overflow,
        height: el.getBoundingClientRect().height,
        top: el.getBoundingClientRect().top,
      });
      el = el.parentElement;
    }
    return out;
  });
  console.log("Parent chain:", JSON.stringify(chain, null, 2));

  // Check for sticky/fixed header overlap
  const overlap = await page.evaluate(() => {
    const orange = Array.from(document.querySelectorAll("*")).find((el) => {
      const cs = getComputedStyle(el);
      return cs.backgroundColor.includes("rgb(255") && el.getBoundingClientRect().height > 50;
    });
    if (!orange) return null;
    const cs = getComputedStyle(orange);
    return {
      tag: orange.tagName,
      cls: orange.className,
      position: cs.position,
      bottom: orange.getBoundingClientRect().bottom,
      height: orange.getBoundingClientRect().height,
    };
  });
  console.log("Orange-ish element:", JSON.stringify(overlap, null, 2));

  // page-header structure
  const header = await page.evaluate(() => {
    const ph = document.querySelector(".page-header");
    if (!ph) return null;
    const cs = getComputedStyle(ph);
    const rect = ph.getBoundingClientRect();
    return {
      childCount: ph.children.length,
      childTags: Array.from(ph.children).map((c) => `${c.tagName}.${c.className}`),
      flexDirection: cs.flexDirection,
      width: rect.width,
      height: rect.height,
      top: rect.top,
    };
  });
  console.log(".page-header:", JSON.stringify(header, null, 2));

  // Dismiss tour + screenshot only the H1 + screenshot full
  await page.evaluate(() => {
    document.querySelectorAll("[class*='tour']").forEach((el) => el.remove());
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  const h1Loc = page.locator(".page-title").first();
  await h1Loc.screenshot({ path: "e2e-tests/test-results/inspect-units-h1-only.png" });

  // Get raw HTML + innerText
  const inner = await page.evaluate(() => {
    const h1 = document.querySelector(".page-title") as HTMLElement;
    return {
      outerHTML: h1?.outerHTML,
      innerText: h1?.innerText,
      childNodes: Array.from(h1?.childNodes || []).map((n) => ({
        nodeType: n.nodeType,
        nodeValue: n.nodeValue,
        text: (n as any).innerText || (n as any).textContent,
      })),
    };
  });
  console.log("H1 innerHTML:", JSON.stringify(inner, null, 2));
});
