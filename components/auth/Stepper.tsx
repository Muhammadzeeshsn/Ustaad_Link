import React from "react";
import { CheckCircle2 } from "lucide-react";

export function Stepper({
  step, setStep, titles,
}: { step: number; setStep: (n: number) => void; titles: string[] }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      {titles.map((t, i) => {
        const idx = i + 1;
        const active = idx === step;
        const done = idx < step;
        return (
          <button
            key={t}
            type="button"
            onClick={() => setStep(idx)}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs border transition-colors ${
              active ? "bg-primary text-primary-foreground border-primary" :
              done ? "bg-primary/10 text-primary border-primary/40" : "bg-muted text-muted-foreground"
            }`}
          >
            {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="inline-block h-3 w-3 rounded-full bg-current/70" />}
            <span className="hidden sm:inline">{t}</span>
          </button>
        );
      })}
    </div>
  );
}
