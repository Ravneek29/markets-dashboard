import { useMemo, useState } from "react";
import { useLiveMarketData } from "./hooks/useLiveMarketData";
import { PriceChart } from "./components/PriceChart";
import { Watchlist } from "./components/Watchlist";
import { StatCard, StatusPill } from "./components/StatCard";
import { INSTRUMENTS } from "./lib/marketFeed";
import { formatClock, formatPercent } from "./lib/format";
import type { Quote } from "./types";

export default function App() {
  const { quotes, status, toggle } = useLiveMarketData(INSTRUMENTS);
  const [selected, setSelected] = useState<string>(INSTRUMENTS[0].symbol);

  const list = useMemo<Quote[]>(() => Object.values(quotes), [quotes]);
  const selectedQuote = quotes[selected];

  const { gainer, loser, lastUpdate } = useMemo(() => {
    if (list.length === 0) {
      return { gainer: undefined, loser: undefined, lastUpdate: 0 };
    }
    const byChange = [...list].sort((a, b) => b.changePct - a.changePct);
    return {
      gainer: byChange[0],
      loser: byChange[byChange.length - 1],
      lastUpdate: Math.max(...list.map((q) => q.updatedAt)),
    };
  }, [list]);

  return (
    <div className="app">
      <header className="app__bar">
        <div className="app__brand">
          <span className="app__mark">◆</span>
          <span className="app__wordmark">TAPE</span>
          <span className="app__tagline">live markets</span>
        </div>
        <div className="app__bar-right">
          <span className="app__clock" data-testid="clock">
            {lastUpdate ? formatClock(lastUpdate) : "--:--:--"}
          </span>
          <StatusPill status={status} />
          <button type="button" className="app__toggle" onClick={toggle}>
            {status === "paused" ? "Resume" : "Pause"}
          </button>
        </div>
      </header>

      <section className="app__stats" aria-label="Market summary">
        <StatCard label="Instruments" value={String(list.length)} sub="streaming" />
        <StatCard
          label="Top gainer"
          value={gainer ? gainer.symbol : "--"}
          sub={gainer ? formatPercent(gainer.changePct) : ""}
          tone="up"
        />
        <StatCard
          label="Top loser"
          value={loser ? loser.symbol : "--"}
          sub={loser ? formatPercent(loser.changePct) : ""}
          tone="down"
        />
        <StatCard
          label="Update rate"
          value="1s"
          sub="per tick"
          tone="neutral"
        />
      </section>

      <main className="app__grid">
        <PriceChart quote={selectedQuote} />
        <Watchlist quotes={quotes} selected={selected} onSelect={setSelected} />
      </main>

      <footer className="app__foot">
        <span>
          Real-time feed is simulated for this demo. Built with React and TypeScript by Ravneek Bhullar
          {" · "}
          
            href="https://github.com/Ravneek29/markets-dashboard"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--accent)" }}
          >
            View source on GitHub
          </a>
        </span>
      </footer>
    </div>
  );
}
