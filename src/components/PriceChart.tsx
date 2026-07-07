import { memo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Quote } from "../types";
import { formatClock, formatPrice } from "../lib/format";

interface PriceChartProps {
  quote: Quote | undefined;
}

function PriceChartImpl({ quote }: PriceChartProps) {
  if (!quote) {
    return <div className="price-chart price-chart--empty">Select an instrument</div>;
  }

  const tone = quote.changePct >= 0 ? "up" : "down";
  const color = tone === "up" ? "var(--up)" : "var(--down)";
  const data = quote.history.map((p) => ({ t: p.t, price: p.price }));

  return (
    <div className="price-chart" data-testid="price-chart">
      <div className="price-chart__head">
        <div>
          <h2 className="price-chart__symbol">{quote.symbol}</h2>
          <p className="price-chart__name">{quote.name}</p>
        </div>
        <div className="price-chart__quote">
          <span className="price-chart__price" data-testid="chart-price">
            {formatPrice(quote.price)}
          </span>
          <span className={`price-chart__change price-chart__change--${tone}`}>
            {quote.changePct >= 0 ? "+" : ""}
            {quote.changePct.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="price-chart__canvas">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="t"
              tickFormatter={formatClock}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={48}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
              tickFormatter={(v: number) => formatPrice(v)}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
                fontSize: 12,
              }}
              labelFormatter={(t: number) => formatClock(t)}
              formatter={(v: number) => [formatPrice(v), "Price"]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              fill="url(#fill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export const PriceChart = memo(PriceChartImpl);
