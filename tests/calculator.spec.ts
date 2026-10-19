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
    await page.locator('label.switch[for="separator-toggle"]').click();
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

  test("preserves and reformats completed equation after equals when changing precision or separator", async ({ page }) => {
    // Perform 10 ÷ 4 = 2.5
    await press(page, "1");
    await press(page, "0");
    await press(page, "÷");
    await press(page, "4");
    await press(page, "=");
    expect(await getResult(page)).toBe("2.5");
    expect(await getExpression(page)).toBe("10 ÷ 4 =");

    // Open settings and change precision to 2
    await page.locator("#settings-toggle").click();
    await page.locator('.settings-option[data-precision="2"]').click();

    // Expression must be preserved and reformatted (not erased!)
    expect(await getExpression(page)).toBe("10.00 ÷ 4.00 =");
    expect(await getResult(page)).toBe("2.50");

    // Enable separator
    await page.locator('label.switch[for="separator-toggle"]').click();
    expect(await getExpression(page)).toBe("10.00 ÷ 4.00 =");
  });

  test("settings work for current session even when localStorage write fails", async ({ page }) => {
    await page.evaluate(() => {
      Storage.prototype.setItem = () => {
        throw new Error("QuotaExceededError");
      };
    });

    await page.locator("#settings-toggle").click();
    await page.locator('.settings-option[data-theme="solarized"]').click();

    // Theme should still apply in memory
    await expect(page.locator("#calculator")).toHaveAttribute("data-theme", "solarized");
  });

  test("closed settings panel is inert and excluded from keyboard navigation", async ({ page }) => {
    const panel = page.locator("#settings-panel");
    await expect(panel).toHaveAttribute("inert", "");
    await expect(panel).toHaveAttribute("aria-hidden", "true");
    await expect(panel).toHaveCSS("visibility", "hidden");

    // Open panel
    await page.locator("#settings-toggle").click();
    await expect(panel).not.toHaveAttribute("inert");
    await expect(panel).toHaveAttribute("aria-hidden", "false");
    await expect(panel).toHaveCSS("visibility", "visible");

    // Close panel
    await page.locator("#settings-close").click();
    await expect(panel).toHaveAttribute("inert", "");
    await expect(panel).toHaveCSS("visibility", "hidden");
    await expect(page.locator("#settings-toggle")).toBeFocused();
  });

  test("checkboxes have accessible names for screen readers", async ({ page }) => {
    await page.locator("#settings-toggle").click();
    const separatorBox = page.getByRole("checkbox", { name: /Thousands Separator/i });
    await expect(separatorBox).toBeAttached();

    const soundBox = page.getByRole("checkbox", { name: /Sound/i });
    await expect(soundBox).toBeAttached();
  });

  test("pressing Enter on focused settings toggle does not trigger calculator equals", async ({ page }) => {
    // Type 5 + 3
    await press(page, "5");
    await press(page, "+");
    await press(page, "3");

    // Focus settings toggle and press Enter
    await page.locator("#settings-toggle").focus();
    await page.keyboard.press("Enter");

    // Panel should open and calculation must NOT have evaluated to 8
    await expect(page.locator("#settings-panel")).toHaveClass(/open/);
    expect(await getResult(page)).toBe("3");
    expect(await getExpression(page)).toBe("5 +");
  });

  test("keyboard shortcuts work after closing settings with the gear", async ({ page }) => {
    await page.locator("#settings-toggle").click();
    await page.locator("#settings-toggle").click();

    await page.keyboard.type("123");
    expect(await getResult(page)).toBe("123");

    await page.keyboard.press("Backspace");
    expect(await getResult(page)).toBe("12");
  });

  test("calculations proceed normally even if Web Audio fails", async ({ page }) => {
    // Install the failing mock before enabling sound, which creates the context.
    await page.evaluate(() => {
      (window as any).__audioContextConstructorCalls = 0;
      window.AudioContext = class {
        constructor() {
          (window as any).__audioContextConstructorCalls++;
          throw new Error("Audio blocked");
        }
      } as unknown as typeof AudioContext;
    });

    await page.locator("#settings-toggle").click();
    await page.locator('label.switch[for="sound-toggle"]').click();
    expect(await page.evaluate(() => (window as any).__audioContextConstructorCalls)).toBe(1);
    await page.locator("#settings-close").click();

    // Arithmetic should still work without error
    await press(page, "7");
    await press(page, "+");
    await press(page, "2");
    await press(page, "=");
    expect(await getResult(page)).toBe("9");
  });
});

