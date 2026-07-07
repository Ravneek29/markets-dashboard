# Live Markets Dashboard

A real-time markets dashboard built with **React + TypeScript**. Streaming price
data drives a live chart, a sortable watchlist with per-row sparklines, and a
market-summary strip, all updating on each tick. The data feed is simulated
locally so the app runs with zero API keys, and is structured so a real
WebSocket or REST source drops straight in.

**Live demo:** https://markets-dashboard-delta.vercel.app

## What this project demonstrates

- **React 18 + TypeScript** with a typed domain model and strict compiler settings
- **Real-time data architecture**: a `MarketFeed` class with a `subscribe()` /
  `start()` / `stop()` surface that mirrors a real WebSocket, wrapped in a
  reusable `useLiveMarketData` hook
- **Data visualisation** with Recharts (live area chart) and hand-drawn SVG
  sparklines kept cheap enough to render on every row, every tick
- **Interactive UI**: click to select an instrument, sortable columns, live
  up/down flashing, keyboard-accessible rows
- **Testing at two levels**: Vitest + React Testing Library unit tests, and
  Playwright end-to-end tests
- **Continuous integration**: a GitHub Actions pipeline that typechecks, unit
  tests, builds, and runs the e2e suite on every push and on a daily schedule

## Tech stack

React 18, TypeScript, Vite, Recharts, Vitest, React Testing Library, Playwright,
GitHub Actions.

## Getting started

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
```

## Scripts

| Command             | What it does                                      |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Start the Vite dev server                         |
| `npm run build`     | Typecheck and build for production                |
| `npm run preview`   | Serve the production build on port 4173           |
| `npm run typecheck` | Type-check without emitting                       |
| `npm test`          | Run unit tests once (Vitest)                      |
| `npm run test:watch`| Run unit tests in watch mode                      |
| `npm run test:e2e`  | Run Playwright end-to-end tests                   |

Before the first Playwright run, install its browser:

```bash
npx playwright install chromium
```

## Project structure

```
src/
  components/   PriceChart, Watchlist, Sparkline, StatCard  (+ unit tests)
  hooks/        useLiveMarketData
  lib/          marketFeed (streaming source), format       (+ unit tests)
  types.ts      shared domain types
  App.tsx       composition
e2e/            Playwright specs
.github/        CI workflow
```

## Using a real data feed

The dashboard reads from `MarketFeed` in `src/lib/marketFeed.ts`. It is a
simulated random-walk source by default. To go live, replace it with a wrapper
around a real source that keeps the same shape:

```ts
class LiveFeed {
  subscribe(listener: QuoteListener): Unsubscribe { /* attach to onmessage */ }
  start() { /* open the WebSocket */ }
  stop() { /* close it */ }
  getQuotes(): QuoteMap { /* last snapshot */ }
}
```

Then point `useLiveMarketData` at it. Free sources that fit this model include
Finnhub (WebSocket trades), Binance (public WebSocket streams), and Alpha
Vantage (REST polling). Because the component tree only depends on the
`QuoteMap` shape, nothing in the UI changes.

## Testing notes

- Unit tests cover the feed's tick logic (price movement, change %, rolling
  history window, deterministic seeding, subscribe/unsubscribe) and the
  watchlist's sorting and selection behaviour.
- The feed accepts a `seed` so tests are fully deterministic.
- End-to-end tests load the built app and verify the shell renders, rows
  populate, selection drives the chart, sorting reorders rows, prices stream,
  and pause halts the stream.

## Deployment

The build uses a relative `base`, so `dist/` works on a GitHub Pages project
path or at a host root (Vercel, Netlify). Build with `npm run build` and serve
`dist/`.
