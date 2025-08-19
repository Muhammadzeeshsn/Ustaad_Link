import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Label } from "@/components/ui/label";

const DEFAULT_SUBJECTS = [
  "Mathematics","Physics","Chemistry","Biology","Computer Science",
  "English","Urdu","Quran (Nazra)","Quran (Tajweed)","Islamiat",
  "Accounting","Economics","Statistics",
];

export function SubjectPicker({
  value, onChange, suggestions = DEFAULT_SUBJECTS,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  suggestions?: string[];
}) {
  const [q, setQ] = useState("");
  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(q.toLowerCase()) && !value.includes(s)
  );

  const add = (s: string) => {
    const v = s.trim();
    if (!v) return;
    if (!value.includes(v)) onChange([...value, v]);
    setQ("");
  };
  const remove = (s: string) => onChange(value.filter((v) => v !== s));

  return (
    <div className="space-y-2">
      <Label>Subjects</Label>
      <div className="rounded-xl border bg-background p-2">
        <div className="flex flex-wrap gap-2">
          {value.map((s) => (
            <span key={s} className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              {s}
              <button type="button" onClick={() => remove(s)} className="rounded-full bg-primary/10 px-1 text-[10px] leading-none hover:bg-primary/20" aria-label={`Remove ${s}`}>✕</button>
            </span>
          ))}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(q); } }}
            placeholder="Type to search, Enter to add…"
            className="min-w-[160px] flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground/70"
          />
        </div>

        <AnimatePresence>
          {q && filtered.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3"
            >
              {filtered.slice(0, 12).map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => add(s)}
                    className="w-full rounded-lg border bg-card px-3 py-1.5 text-left text-xs hover:border-primary/40 hover:bg-primary/5"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      <p className="text-xs text-muted-foreground">
        Can’t find a subject? Type it and press <strong>Enter</strong>.
      </p>
    </div>
  );
}
