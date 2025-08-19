// components/layout/Navbar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { BrandButton } from "@/components/brand/BrandButton";

const links = [
  { label: "About", href: "/about" },
  { label: "Teachers", href: "/teachers" },
  { label: "Courses", href: "/courses" },
  { label: "Requests", href: "/requests" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [open, setOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/65">
      <div className="wrap flex h-16 items-center justify-between">
        {" "}
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="UstaadLink Home"
        >
          <span className="text-2xl font-extrabold tracking-tight text-primary">
            UstaadLink
          </span>
        </Link>
        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="relative text-sm text-muted-foreground transition-colors hover:text-primary after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary/80 after:transition-[width] hover:after:w-full"
            >
              {l.label}
            </Link>
          ))}
        </div>
        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <BrandButton
            variant="ghost"
            onClick={() => (window.location.href = "/auth")}
          >
            Sign In
          </BrandButton>
          <BrandButton onClick={() => (window.location.href = "/auth")}>
            Become a Tutor
          </BrandButton>
          <BrandButton onClick={() => (window.location.href = "/auth")}>
            Get Started
          </BrandButton>
        </div>
        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <BrandButton
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = "/auth")}
          >
            Sign In
          </BrandButton>
          <BrandButton
            variant="secondary"
            size="sm"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </BrandButton>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t bg-card">
          <div className="container flex flex-col gap-3 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <BrandButton onClick={() => (window.location.href = "/auth")}>
                Get Started
              </BrandButton>
              <BrandButton onClick={() => (window.location.href = "/auth")}>
                Become a Tutor
              </BrandButton>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
