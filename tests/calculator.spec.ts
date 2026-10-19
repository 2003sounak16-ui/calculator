import { test, expect, type Page } from "@playwright/test";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Click a calculator button by its visible label. */
async function press(page: Page, label: string) {
  await page.locator(`.btn`, { hasText: new RegExp(`^${escapeRegex(label)}$`) }).click();
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Read the main result display. */
async function getResult(page: Page) {
  return page.locator("#result").textContent();
}

/** Read the expression / history line. */
async function getExpression(page: Page) {
  return page.locator("#expression").textContent();
}

// ── Setup ────────────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

// ── Display Tests ────────────────────────────────────────────────────────────

test.describe("Display", () => {
  test("shows 0 on initial load", async ({ page }) => {
    await expect(page.locator("#result")).toHaveText("0");
    await expect(page.locator("#expression")).toHaveText("");
  });

  test("displays typed digits", async ({ page }) => {
    await press(page, "1");
    await press(page, "2");
    await press(page, "3");
    expect(await getResult(page)).toBe("123");
  });
});

// ── Basic Arithmetic ─────────────────────────────────────────────────────────

test.describe("Basic Arithmetic", () => {
  test("addition: 5 + 3 = 8", async ({ page }) => {
    await press(page, "5");
    await press(page, "+");
    await press(page, "3");
    await press(page, "=");
    expect(await getResult(page)).toBe("8");
  });

  test("subtraction: 9 − 4 = 5", async ({ page }) => {
    await press(page, "9");
    await press(page, "−");
    await press(page, "4");
    await press(page, "=");
    expect(await getResult(page)).toBe("5");
  });

  test("multiplication: 6 × 7 = 42", async ({ page }) => {
    await press(page, "6");
    await press(page, "×");
    await press(page, "7");
    await press(page, "=");
    expect(await getResult(page)).toBe("42");
  });

  test("division: 8 ÷ 2 = 4", async ({ page }) => {
    await press(page, "8");
    await press(page, "÷");
    await press(page, "2");
    await press(page, "=");
    expect(await getResult(page)).toBe("4");
  });

  test("decimal arithmetic: 1.5 + 2.3 = 3.8", async ({ page }) => {
    await press(page, "1");
    await press(page, ".");
    await press(page, "5");
    await press(page, "+");
    await press(page, "2");
    await press(page, ".");
    await press(page, "3");
    await press(page, "=");
    expect(await getResult(page)).toBe("3.8");
  });
});

// ── Chained Operations ──────────────────────────────────────────────────────

test.describe("Chained Operations", () => {
  test("chained: 2 + 3 + 5 = 10", async ({ page }) => {
    await press(page, "2");
    await press(page, "+");
    await press(page, "3");
    await press(page, "+"); // triggers 2+3=5
    expect(await getResult(page)).toBe("5");
    await press(page, "5");
    await press(page, "="); // triggers 5+5=10
    expect(await getResult(page)).toBe("10");
  });

  test("chained mixed: 10 − 3 × 2 = 14", async ({ page }) => {
    await press(page, "1");
    await press(page, "0");
    await press(page, "−");
    await press(page, "3");
    await press(page, "×"); // triggers 10-3=7
    expect(await getResult(page)).toBe("7");
    await press(page, "2");
    await press(page, "="); // triggers 7×2=14
    expect(await getResult(page)).toBe("14");
  });
});

// ── Special Buttons ─────────────────────────────────────────────────────────

test.describe("Special Buttons", () => {
  test("AC clears everything", async ({ page }) => {
    await press(page, "5");
    await press(page, "+");
    await press(page, "3");
    await press(page, "AC");
    expect(await getResult(page)).toBe("0");
    expect(await getExpression(page)).toBe("");
  });

  test("+/− toggles sign", async ({ page }) => {
    await press(page, "7");
    await press(page, "+/−");
    expect(await getResult(page)).toBe("-7");
    await press(page, "+/−");
    expect(await getResult(page)).toBe("7");
  });

  test("+/− does nothing on 0", async ({ page }) => {
    await press(page, "+/−");
    expect(await getResult(page)).toBe("0");
  });

  test("% converts to percentage", async ({ page }) => {
    await press(page, "5");
    await press(page, "0");
    await press(page, "%");
    expect(await getResult(page)).toBe("0.5");
  });
});

// ── Edge Cases ──────────────────────────────────────────────────────────────

test.describe("Edge Cases", () => {
  test("division by zero shows Error", async ({ page }) => {
    await press(page, "5");
    await press(page, "÷");
    await press(page, "0");
    await press(page, "=");
    expect(await getResult(page)).toBe("Error");
  });

  test("AC recovers from Error state", async ({ page }) => {
    await press(page, "5");
    await press(page, "÷");
    await press(page, "0");
    await press(page, "=");
    expect(await getResult(page)).toBe("Error");
    await press(page, "AC");
    expect(await getResult(page)).toBe("0");
  });

  test("typing after Error auto-clears", async ({ page }) => {
    await press(page, "5");
    await press(page, "÷");
    await press(page, "0");
    await press(page, "=");
    await press(page, "9");
    expect(await getResult(page)).toBe("9");
  });

  test("leading zeros are suppressed", async ({ page }) => {
    await press(page, "0");
    await press(page, "0");
    await press(page, "5");
    expect(await getResult(page)).toBe("5");
  });

  test("multiple decimals are ignored", async ({ page }) => {
    await press(page, "3");
    await press(page, ".");
    await press(page, "1");
    await press(page, ".");
    await press(page, "4");
    expect(await getResult(page)).toBe("3.14");
  });

  test("expression line shows full equation after equals", async ({ page }) => {
    await press(page, "4");
    await press(page, "+");
    await press(page, "6");
    await press(page, "=");
    expect(await getExpression(page)).toContain("4");
    expect(await getExpression(page)).toContain("+");
    expect(await getExpression(page)).toContain("6");
    expect(await getExpression(page)).toContain("=");
  });
});

// ── Keyboard Support ────────────────────────────────────────────────────────

test.describe("Keyboard Support", () => {
  test("type digits and operators via keyboard", async ({ page }) => {
    await page.keyboard.type("5");
    await page.keyboard.type("+");
    await page.keyboard.type("3");
    await page.keyboard.press("Enter");
    expect(await getResult(page)).toBe("8");
  });

  test("Escape clears via keyboard", async ({ page }) => {
    await page.keyboard.type("123");
    await page.keyboard.press("Escape");
    expect(await getResult(page)).toBe("0");
  });

  test("Backspace deletes last digit", async ({ page }) => {
    await page.keyboard.type("42");
    await page.keyboard.press("Backspace");
    expect(await getResult(page)).toBe("4");
  });

  test("Backspace on single digit resets to 0", async ({ page }) => {
    await page.keyboard.type("7");
    await page.keyboard.press("Backspace");
    expect(await getResult(page)).toBe("0");
  });

  test("all keyboard operators work", async ({ page }) => {
    // Subtraction
    await page.keyboard.type("9-4");
    await page.keyboard.press("Enter");
    expect(await getResult(page)).toBe("5");

    await page.keyboard.press("Escape");

    // Multiplication
    await page.keyboard.type("6*7");
    await page.keyboard.press("Enter");
    expect(await getResult(page)).toBe("42");

    await page.keyboard.press("Escape");

    // Division
    await page.keyboard.type("8/2");
    await page.keyboard.press("Enter");
    expect(await getResult(page)).toBe("4");
  });
});

// ── Settings Panel ──────────────────────────────────────────────────────────

test.describe("Settings Panel", () => {
  test("opens and closes settings panel", async ({ page }) => {
    const panel = page.locator("#settings-panel");
    await expect(panel).not.toHaveClass(/open/);

    await page.locator("#settings-toggle").click();
    await expect(panel).toHaveClass(/open/);

    await page.locator("#settings-close").click();
    await expect(panel).not.toHaveClass(/open/);
  });

  test("changes theme to light, solarized, and back to dark", async ({ page }) => {
    await page.locator("#settings-toggle").click();

    // Select light
    await page.locator('.settings-option[data-theme="light"]').click();
    await expect(page.locator("#calculator")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("body")).toHaveAttribute("data-theme", "light");

    // Select solarized
    await page.locator('.settings-option[data-theme="solarized"]').click();
    await expect(page.locator("#calculator")).toHaveAttribute("data-theme", "solarized");
    await expect(page.locator("body")).toHaveAttribute("data-theme", "solarized");

    // Back to dark
    await page.locator('.settings-option[data-theme="dark"]').click();
    await expect(page.locator("#calculator")).toHaveAttribute("data-theme", "dark");
  });

  test("applies decimal precision formatting", async ({ page }) => {
    await page.locator("#settings-toggle").click();
    await page.locator('.settings-option[data-precision="2"]').click();
    await page.locator("#settings-close").click();

    // 10 ÷ 4 = 2.50 with precision 2
    await press(page, "1");
    await press(page, "0");
    await press(page, "÷");
    await press(page, "4");
    await press(page, "=");
    expect(await getResult(page)).toBe("2.50");
  });

  test("applies thousands separator formatting", async ({ page }) => {
    await page.locator("#settings-toggle").click();
    await page.locator('label[for="separator-toggle"], .settings-group:has-text("Thousands Separator") .slider').click();
    await page.locator("#settings-close").click();

    // 5000 + 5000 = 10,000
    await press(page, "5");
    await press(page, "0");
    await press(page, "0");
    await press(page, "0");
    await press(page, "+");
    await press(page, "5");
    await press(page, "0");
    await press(page, "0");
    await press(page, "0");
    await press(page, "=");
    expect(await getResult(page)).toBe("10,000");
  });

  test("disables keyboard typing when settings panel is open", async ({ page }) => {
    await page.locator("#settings-toggle").click();
    await expect(page.locator("#settings-panel")).toHaveClass(/open/);

    await page.keyboard.type("12345");
    expect(await getResult(page)).toBe("0");
  });

  test("persists settings across page reload", async ({ page }) => {
    await page.locator("#settings-toggle").click();
    await page.locator('.settings-option[data-theme="solarized"]').click();
    await page.locator('.settings-option[data-precision="4"]').click();

    await page.reload();

    await expect(page.locator("#calculator")).toHaveAttribute("data-theme", "solarized");
    await page.locator("#settings-toggle").click();
    await expect(page.locator('.settings-option[data-precision="4"]')).toHaveClass(/active/);
  });
});

