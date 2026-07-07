import { expect, test } from "@playwright/test";

test.describe("Live Markets Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the dashboard shell", async ({ page }) => {
    await expect(page.getByText("TAPE")).toBeVisible();
    await expect(page.getByTestId("watchlist")).toBeVisible();
    await expect(page.getByTestId("price-chart")).toBeVisible();
    await expect(page.getByRole("status")).toContainText("Live");
  });

  test("lists every instrument in the watchlist", async ({ page }) => {
    const rows = page.locator("[data-symbol]");
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeGreaterThanOrEqual(6);
  });

  test("selecting a row drives the chart", async ({ page }) => {
    const row = page.locator("[data-symbol=MSFT]");
    await row.click();
    await expect(row).toHaveAttribute("data-selected", "true");
    await expect(page.getByTestId("price-chart").getByText("MSFT")).toBeVisible();
  });

  test("sorting by symbol reorders the rows", async ({ page }) => {
    await page.getByRole("button", { name: /symbol/i }).click();
    const first = page.locator("[data-symbol]").first();
    await expect(first).toHaveAttribute("data-symbol", "AAPL");
  });

  test("prices stream and update over time", async ({ page }) => {
    const price = page.getByTestId("chart-price");
    const before = await price.textContent();
    await expect(async () => {
      const now = await price.textContent();
      expect(now).not.toBe(before);
    }).toPass({ timeout: 8000 });
  });

  test("pause halts the stream", async ({ page }) => {
    await page.getByRole("button", { name: "Pause" }).click();
    await expect(page.getByRole("status")).toContainText("Paused");
  });
});
