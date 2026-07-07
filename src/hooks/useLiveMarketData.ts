import { useCallback, useEffect, useMemo, useState } from "react";
import { MarketFeed, type FeedOptions } from "../lib/marketFeed";
import type { ConnectionStatus, Instrument, QuoteMap } from "../types";

interface UseLiveMarketData {
  quotes: QuoteMap;
  status: ConnectionStatus;
  /** Pause or resume the stream. */
  toggle: () => void;
}

/**
 * Subscribes to a MarketFeed and re-renders on each tick. The feed is created
 * once per set of options; swap MarketFeed for a real WebSocket wrapper with
 * the same subscribe()/start()/stop() surface to go live.
 */
export function useLiveMarketData(
  instruments?: Instrument[],
  options?: FeedOptions,
): UseLiveMarketData {
  const feed = useMemo(
    () => new MarketFeed(instruments, options),
    // Re-create only if the instrument set identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [instruments],
  );

  const [quotes, setQuotes] = useState<QuoteMap>(() => feed.getQuotes());
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  useEffect(() => {
    const unsubscribe = feed.subscribe(setQuotes);
    feed.start();
    setStatus("live");
    return () => {
      unsubscribe();
      feed.stop();
    };
  }, [feed]);

  const toggle = useCallback(() => {
    if (feed.isRunning) {
      feed.stop();
      setStatus("paused");
    } else {
      feed.start();
      setStatus("live");
    }
  }, [feed]);

  return { quotes, status, toggle };
}
