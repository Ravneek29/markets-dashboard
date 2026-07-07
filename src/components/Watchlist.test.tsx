import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Watchlist } from "./Watchlist";
import type { Quote, QuoteMap } from "../types";

function quote(symbol: string, name: string, price: number, changePct: number): Quote {
  return {
    symbol,
    name,
    price,
    prevPrice: price,
    open: price / (1 + changePct / 100),
    changeAbs: 0,
    changePct,
    updatedAt: 0,
    history: [
      { t: 0, price: price - 1 },
      { t: 1, price },
    ],
  };
}

const quotes: QuoteMap = {
  AAA: quote("AAA", "Alpha", 100, 2.5),
  BBB: quote("BBB", "Beta", 50, -1.2),
  CCC: quote("CCC", "Gamma", 75, 0.4),
};

function rowSymbols(): string[] {
  return screen
    .getAllByRole("row")
    .slice(1) // drop header row
    .map((r) => r.getAttribute("data-symbol") ?? "");
}

describe("Watchlist", () => {
  it("renders a row per instrument", () => {
    render(<Watchlist quotes={quotes} selected="AAA" onSelect={() => {}} />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(rowSymbols()).toHaveLength(3);
  });

  it("defaults to sorting by change, descending", () => {
    render(<Watchlist quotes={quotes} selected="AAA" onSelect={() => {}} />);
    expect(rowSymbols()).toEqual(["AAA", "CCC", "BBB"]);
  });

  it("toggles sort direction when the active header is clicked", async () => {
    const user = userEvent.setup();
    render(<Watchlist quotes={quotes} selected="AAA" onSelect={() => {}} />);
    await user.click(screen.getByRole("button", { name: /change/i }));
    expect(rowSymbols()).toEqual(["BBB", "CCC", "AAA"]);
  });

  it("sorts alphabetically by symbol", async () => {
    const user = userEvent.setup();
    render(<Watchlist quotes={quotes} selected="AAA" onSelect={() => {}} />);
    await user.click(screen.getByRole("button", { name: /symbol/i }));
    expect(rowSymbols()).toEqual(["AAA", "BBB", "CCC"]);
  });

  it("calls onSelect with the clicked symbol", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Watchlist quotes={quotes} selected="AAA" onSelect={onSelect} />);
    const betaRow = screen.getByText("Beta").closest("tr")!;
    await user.click(within(betaRow).getByText("Beta"));
    expect(onSelect).toHaveBeenCalledWith("BBB");
  });

  it("marks the selected row", () => {
    render(<Watchlist quotes={quotes} selected="BBB" onSelect={() => {}} />);
    const selected = screen
      .getAllByRole("row")
      .find((r) => r.getAttribute("data-selected") === "true");
    expect(selected?.getAttribute("data-symbol")).toBe("BBB");
  });
});
