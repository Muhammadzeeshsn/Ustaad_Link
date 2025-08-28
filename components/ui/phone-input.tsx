// components/ui/phone-input.tsx
"use client";

import * as React from "react";
import { Country } from "country-state-city";

// If you don't have cn(), replace cn(...) with a simple joiner:
// function cn(...a: (string | false | null | undefined)[]) { return a.filter(Boolean).join(" "); }
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  required?: boolean;
  placeholder?: string;
};

type DialCountry = {
  name: string;
  iso: string;
  dial: string; // "92"
};

const COUNTRIES: DialCountry[] = Country.getAllCountries().map((c) => ({
  name: c.name,
  iso: c.isoCode,
  dial: String(c.phonecode || "").replace(/^\+/, ""),
}));

function isoToEmojiFlag(iso: string) {
  if (!iso || iso.length !== 2) return "🏳️";
  const A = 0x1f1e6;
  const codePoints = iso
    .toUpperCase()
    .split("")
    .map((ch) => A + (ch.charCodeAt(0) - 65));
  return String.fromCodePoint(...codePoints);
}

function splitPhone(v: string): { dial: string; local: string } {
  // normalize to digits only (ignore spaces, hyphens, etc.)
  const digits = String(v || "").replace(/[^\d]/g, "");

  // find the longest known dial code that matches the beginning
  let best = "";
  for (const c of COUNTRIES) {
    if (digits.startsWith(c.dial) && c.dial.length > best.length) {
      best = c.dial;
    }
  }

  if (best) {
    return { dial: best, local: digits.slice(best.length) };
  }
  // If we can't match a known dial, treat everything as local
  return { dial: "", local: digits };
}

export function PhoneInput({
  value,
  onChange,
  className,
  required,
  placeholder,
}: Props) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const numberRef = React.useRef<HTMLInputElement>(null);

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const { dial: parsedDial, local: parsedLocal } = React.useMemo(
    () => splitPhone(value),
    [value]
  );
  const [dial, setDial] = React.useState(parsedDial);
  const [local, setLocal] = React.useState(parsedLocal);

  // keep internal state in sync if parent changes from outside
  React.useEffect(() => {
    const p = splitPhone(value);
    setDial(p.dial);
    setLocal(p.local);
  }, [value]);

  // Autofocus search when opened
  React.useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 0);
  }, [open]);

  // Close on outside click / tap
  React.useEffect(() => {
    function onDocPointerDown(e: PointerEvent) {
      if (!open) return;
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onDocPointerDown, {
      passive: true,
    });
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const selected = React.useMemo(
    () => COUNTRIES.find((c) => c.dial === dial) || null,
    [dial]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso.toLowerCase().includes(q) ||
        c.dial.includes(q.replace(/^\+/, ""))
    );
  }, [query]);

  function commit(nextDial: string, nextLocal: string) {
    const localDigits = String(nextLocal || "").replace(/\D+/g, "");
    const out = nextDial ? `+${nextDial}${localDigits}` : localDigits;
    onChange(out);
  }

  function pickCountry(c: DialCountry) {
    setDial(c.dial);
    commit(c.dial, local);
    setOpen(false); // ✅ close immediately on selection
    // focus number field after closing
    setTimeout(() => numberRef.current?.focus(), 0);
  }

  return (
    <div ref={rootRef} className={cn("flex items-stretch gap-2", className)}>
      {/* Dial trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            if (!open) setQuery("");
          }}
          className="inline-flex items-center gap-2 rounded-lg border bg-background px-2.5 py-2 text-sm hover:bg-muted"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="text-lg">
            {selected ? isoToEmojiFlag(selected.iso) : "🌐"}
          </span>
          <span className="tabular-nums">{dial ? `+${dial}` : "+__"}</span>
          <svg
            className="ml-1 h-4 w-4 opacity-70"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
          </svg>
        </button>

        {open && (
          <div
            className="absolute z-50 mt-2 w-[320px] overflow-hidden rounded-xl border bg-background shadow-xl"
            role="listbox"
          >
            <div className="border-b bg-muted/40 p-2">
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filtered[0]) {
                    e.preventDefault();
                    pickCountry(filtered[0]); // ✅ Enter selects top result & closes
                  }
                }}
                placeholder="Search country / code…"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2"
              />
            </div>
            <div className="max-h-72 overflow-auto">
              {filtered.map((c) => {
                const active = c.dial === dial;
                return (
                  <button
                    key={`${c.iso}-${c.dial}`}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted",
                      active && "bg-primary/10"
                    )}
                    // Use onMouseDown so selection fires even if focus shifts;
                    // also prevents the input from blurring while we handle it.
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pickCountry(c); // ✅ closes dropdown on pick
                    }}
                  >
                    <span className="text-lg">{isoToEmojiFlag(c.iso)}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      +{c.dial}
                    </span>
                  </button>
                );
              })}
              {!filtered.length && (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No matches
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Number field */}
      <input
        ref={numberRef}
        required={required}
        value={local}
        onChange={(e) => {
          const next = e.target.value.replace(/[^\d\s\-().]/g, "");
          setLocal(next);
          commit(dial, next);
        }}
        placeholder={placeholder || "300 1234567"}
        className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2"
        inputMode="tel"
        autoComplete="tel"
      />
    </div>
  );
}
