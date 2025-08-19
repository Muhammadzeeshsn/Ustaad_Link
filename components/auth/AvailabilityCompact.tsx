import React from "react";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

export function AvailabilityCompact({
  days, setDays, start, setStart, end, setEnd,
}: {
  days: Record<string, boolean>;
  setDays: (d: Record<string, boolean>) => void;
  start: string; setStart: (v: string) => void;
  end: string; setEnd: (v: string) => void;
}) {
  const toggle = (d: string) => setDays({ ...days, [d]: !days[d] });
  const keys = Object.keys(days);
  const times = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <Clock className="h-4 w-4" /> Availability
      </div>
      <div className="flex flex-wrap gap-2">
        {keys.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => toggle(d)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              days[d] ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="start">Start</Label>
          <select id="start" value={start} onChange={(e) => setStart(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2 text-sm">
            {times.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="end">End</Label>
          <select id="end" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2 text-sm">
            {times.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
