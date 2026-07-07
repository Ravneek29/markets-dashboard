import { describe, expect, it, vi } from "vitest";
import { INSTRUMENTS, MarketFeed } from "./marketFeed";
import type { Instrument } from "../types";

const TWO: Instrument[] = [
  { symbol: "AAA", name: "Alpha", open: 100 },
  { symbol: "BBB", name: "Beta", open: 50 },
];

describe("MarketFeed", () => {
  it("seeds a quote for every instrument at the opening price", () => {
    const feed = new MarketFeed(TWO, { seed: 1 });
    const quotes = feed.getQuotes();
    expect(Object.keys(quotes)).toHaveLength(2);
    expect(quotes.AAA.price).toBe(100);
    expect(quotes.AAA.changePct).toBe(0);
    expect(quotes.AAA.history).toHaveLength(1);
  });

  it("delivers the current snapshot immediately on subscribe", () => {
    const feed = new MarketFeed(TWO, { seed: 1 });
    const listener = vi.fn();
    feed.subscribe(listener);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].BBB.symbol).toBe("BBB");
  });

  it("moves prices and recomputes change on tick", () => {
    const feed = new MarketFeed(TWO, { seed: 7 });
    const before = feed.getQuotes().AAA.price;
    feed.tick();
    const after = feed.getQuotes().AAA;
    expect(after.price).not.toBe(before);
    expect(after.prevPrice).toBe(before);
    expect(after.changePct).toBeCloseTo(((after.price - 100) / 100) * 100, 5);
    expect(after.history).toHaveLength(2);
  });

  it("is deterministic for a fixed seed", () => {
    const a = new MarketFeed(TWO, { seed: 42 });
    const b = new MarketFeed(TWO, { seed: 42 });
    a.tick();
    b.tick();
    expect(a.getQuotes().AAA.price).toBe(b.getQuotes().AAA.price);
  });

  it("caps the rolling history window", () => {
    const feed = new MarketFeed(TWO, { seed: 3 });
    for (let i = 0; i < 80; i++) feed.tick();
    expect(feed.getQuotes().AAA.history.length).toBeLessThanOrEqual(60);
  });

  it("notifies subscribers on every tick and stops after unsubscribe", () => {
    const feed = new MarketFeed(TWO, { seed: 5 });
    const listener = vi.fn();
    const unsubscribe = feed.subscribe(listener);
    feed.tick();
    expect(listener).toHaveBeenCalledTimes(2); // initial + one tick
    unsubscribe();
    feed.tick();
    expect(listener).toHaveBeenCalledTimes(2); // no further calls
  });

  it("start/stop toggles the running flag", () => {
    vi.useFakeTimers();
    const feed = new MarketFeed(TWO, { seed: 9, intervalMs: 100 });
    const listener = vi.fn();
    feed.subscribe(listener);
    feed.start();
    expect(feed.isRunning).toBe(true);
    vi.advanceTimersByTime(350);
    feed.stop();
    expect(feed.isRunning).toBe(false);
    expect(listener.mock.calls.length).toBeGreaterThanOrEqual(4); // initial + 3 ticks
    vi.useRealTimers();
  });

  it("ships a default instrument universe", () => {
    expect(INSTRUMENTS.length).toBeGreaterThanOrEqual(6);
  });
});
