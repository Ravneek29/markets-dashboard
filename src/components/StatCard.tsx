import type { ConnectionStatus } from "../types";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  tone?: "up" | "down" | "flat" | "neutral";
}

export function StatCard({ label, value, sub, tone = "neutral" }: StatCardProps) {
  return (
    <div className="stat-card">
      <span className="stat-card__label">{label}</span>
      <span className={`stat-card__value stat-card__value--${tone}`}>{value}</span>
      {sub && <span className="stat-card__sub">{sub}</span>}
    </div>
  );
}

export function StatusPill({ status }: { status: ConnectionStatus }) {
  const text =
    status === "live" ? "Live" : status === "paused" ? "Paused" : "Connecting";
  return (
    <span className={`status-pill status-pill--${status}`} role="status">
      <span className="status-pill__dot" aria-hidden="true" />
      {text}
    </span>
  );
}
