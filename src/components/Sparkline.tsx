import { memo } from "react";
import type { PricePoint } from "../types";

interface SparklineProps {
  data: PricePoint[];
  tone: "up" | "down" | "flat";
  width?: number;
  height?: number;
}

/**
 * Minimal inline SVG sparkline. Hand-drawn rather than charted so it stays cheap
 * to render across every watchlist row on each tick.
 */
function SparklineImpl({ data, tone, width = 96, height = 28 }: SparklineProps) {
  if (data.length < 2) {
    return <svg width={width} height={height} aria-hidden="true" />;
  }
  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = prices
    .map((p, i) => {
      const x = i * stepX;
      const y = height - ((p - min) / span) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const color =
    tone === "up"
      ? "var(--up)"
      : tone === "down"
        ? "var(--down)"
        : "var(--muted)";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="sparkline"
      role="img"
      aria-label={`Trend ${tone}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const Sparkline = memo(SparklineImpl);
