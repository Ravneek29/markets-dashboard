/** A single point on a price series. */
export interface PricePoint {
  /** Epoch milliseconds. */
  t: number;
  price: number;
}

/** A tradable instrument the feed knows how to quote. */
export interface Instrument {
  symbol: string;
  name: string;
  /** Session opening price, used as the baseline for change %. */
  open: number;
}

/** A live quote: latest price plus a rolling history window. */
export interface Quote {
  symbol: string;
  name: string;
  price: number;
  /** Price on the previous tick, used to flash rows up/down. */
  prevPrice: number;
  open: number;
  changeAbs: number;
  changePct: number;
  updatedAt: number;
  /** Rolling window of recent points for sparklines and the main chart. */
  history: PricePoint[];
}

/** Map of symbol -> latest quote. */
export type QuoteMap = Record<string, Quote>;

export type ConnectionStatus = "connecting" | "live" | "paused";

export type QuoteListener = (quotes: QuoteMap) => void;
export type Unsubscribe = () => void;

export type SortKey = "symbol" | "price" | "changePct";
export type SortDirection = "asc" | "desc";
