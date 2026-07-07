import { useMemo, useState } from "react";
import type { Quote, QuoteMap, SortDirection, SortKey } from "../types";
import { formatPercent, formatPrice } from "../lib/format";
import { Sparkline } from "./Sparkline";

interface WatchlistProps {
  quotes: QuoteMap;
  selected: string;
  onSelect: (symbol: string) => void;
}

const COLUMNS: { key: SortKey; label: string; align: "left" | "right" }[] = [
  { key: "symbol", label: "Symbol", align: "left" },
  { key: "price", label: "Price", align: "right" },
  { key: "changePct", label: "Change", align: "right" },
];

function sortQuotes(list: Quote[], key: SortKey, dir: SortDirection): Quote[] {
  const factor = dir === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    if (key === "symbol") return a.symbol.localeCompare(b.symbol) * factor;
    return (a[key] - b[key]) * factor;
  });
}

export function Watchlist({ quotes, selected, onSelect }: WatchlistProps) {
  const [sortKey, setSortKey] = useState<SortKey>("changePct");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const rows = useMemo(
    () => sortQuotes(Object.values(quotes), sortKey, sortDir),
    [quotes, sortKey, sortDir],
  );

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "symbol" ? "asc" : "desc");
    }
  }

  return (
    <div className="watchlist" data-testid="watchlist">
      <div className="watchlist__head">
        <h2 className="watchlist__title">Watchlist</h2>
        <span className="watchlist__count">{rows.length} instruments</span>
      </div>
      <table className="watchlist__table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={`watchlist__th watchlist__th--${col.align}`}
                aria-sort={
                  sortKey === col.key
                    ? sortDir === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <button
                  type="button"
                  className="watchlist__sort"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="watchlist__arrow" aria-hidden="true">
                      {sortDir === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </button>
              </th>
            ))}
            <th className="watchlist__th watchlist__th--right">Trend</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((q) => {
            const tone = q.changePct > 0 ? "up" : q.changePct < 0 ? "down" : "flat";
            const flash =
              q.price > q.prevPrice ? "up" : q.price < q.prevPrice ? "down" : "flat";
            return (
              <tr
                key={q.symbol}
                className={`watchlist__row ${
                  q.symbol === selected ? "watchlist__row--selected" : ""
                }`}
                data-symbol={q.symbol}
                data-selected={q.symbol === selected}
                onClick={() => onSelect(q.symbol)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(q.symbol);
                  }
                }}
              >
                <td className="watchlist__symbol">
                  <span className="watchlist__ticker">{q.symbol}</span>
                  <span className="watchlist__name">{q.name}</span>
                </td>
                <td className={`watchlist__num watchlist__num--flash-${flash}`}>
                  {formatPrice(q.price)}
                </td>
                <td className={`watchlist__num watchlist__change--${tone}`}>
                  {formatPercent(q.changePct)}
                </td>
                <td className="watchlist__spark">
                  <Sparkline data={q.history} tone={tone} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
