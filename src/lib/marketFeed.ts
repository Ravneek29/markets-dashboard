import type {
  Instrument,
  QuoteMap,
  QuoteListener,
  Unsubscribe,
} from "../types";

/**
 * Default universe of instruments the demo feed quotes. Prices are illustrative
 * starting points only. See README "Using a real data feed" for how to replace
 * this simulated feed with a live WebSocket or REST source.
 */
export const INSTRUMENTS: Instrument[] = [
  { symbol: "AAPL", name: "Apple", open: 224.5 },
  { symbol: "MSFT", name: "Microsoft", open: 438.2 },
  { symbol: "NVDA", name: "NVIDIA", open: 121.4 },
  { symbol: "AMZN", name: "Amazon", open: 178.9 },
  { symbol: "GOOGL", name: "Alphabet", open: 165.3 },
  { symbol: "META", name: "Meta Platforms", open: 512.7 },
  { symbol: "TSLA", name: "Tesla", open: 248.1 },
  { symbol: "JPM", name: "JPMorgan Chase", open: 214.6 },
];

const HISTORY_WINDOW = 60;

/** Small, fast, seedable PRNG (mulberry32) so tests are deterministic. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface FeedOptions {
  /** How often start() emits a new tick, in ms. Default 1000. */
  intervalMs?: number;
  /** Per-tick volatility as a fraction of price. Default 0.004 (0.4%). */
  volatility?: number;
  /** Seed for deterministic output (tests). Omit for a random walk. */
  seed?: number;
  /** Starting timestamp; defaults to Date.now(). */
  startTime?: number;
}

/**
 * A simulated market data feed with the same shape you'd wrap around a real
 * WebSocket: subscribe() to receive quote updates, start()/stop() to control
 * the stream, and tick() to advance one step (used directly in unit tests).
 */
export class MarketFeed {
  private readonly instruments: Instrument[];
  private readonly intervalMs: number;
  private readonly volatility: number;
  private readonly rand: () => number;
  private quotes: QuoteMap;
  private listeners = new Set<QuoteListener>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private now: number;

  constructor(instruments: Instrument[] = INSTRUMENTS, options: FeedOptions = {}) {
    this.instruments = instruments;
    this.intervalMs = options.intervalMs ?? 1000;
    this.volatility = options.volatility ?? 0.004;
    this.rand = options.seed === undefined ? Math.random : mulberry32(options.seed);
    this.now = options.startTime ?? Date.now();
    this.quotes = this.seedQuotes();
  }

  private seedQuotes(): QuoteMap {
    const map: QuoteMap = {};
    for (const inst of this.instruments) {
      map[inst.symbol] = {
        symbol: inst.symbol,
        name: inst.name,
        price: inst.open,
        prevPrice: inst.open,
        open: inst.open,
        changeAbs: 0,
        changePct: 0,
        updatedAt: this.now,
        history: [{ t: this.now, price: inst.open }],
      };
    }
    return map;
  }

  /** Current snapshot of all quotes. */
  getQuotes(): QuoteMap {
    return this.quotes;
  }

  /** Register a listener. Returns an unsubscribe function. */
  subscribe(listener: QuoteListener): Unsubscribe {
    this.listeners.add(listener);
    listener(this.quotes);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Advance the simulation by one tick and notify listeners. */
  tick(): void {
    this.now += this.intervalMs;
    const next: QuoteMap = {};
    for (const symbol of Object.keys(this.quotes)) {
      const q = this.quotes[symbol];
      // Random walk with mild mean-reversion toward the session open.
      const drift = (q.open - q.price) * 0.02;
      const shock = (this.rand() - 0.5) * 2 * this.volatility * q.price;
      const price = Math.max(0.01, q.price + drift + shock);
      const history = [...q.history, { t: this.now, price }].slice(-HISTORY_WINDOW);
      next[symbol] = {
        ...q,
        prevPrice: q.price,
        price,
        changeAbs: price - q.open,
        changePct: ((price - q.open) / q.open) * 100,
        updatedAt: this.now,
        history,
      };
    }
    this.quotes = next;
    this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) listener(this.quotes);
  }

  /** Begin emitting ticks on an interval. */
  start(): void {
    if (this.timer !== null) return;
    this.timer = setInterval(() => this.tick(), this.intervalMs);
  }

  /** Stop emitting ticks. Safe to call when already stopped. */
  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  get isRunning(): boolean {
    return this.timer !== null;
  }
}
