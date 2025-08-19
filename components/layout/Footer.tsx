// components/layout/Footer.tsx
"use client";

import * as React from "react";
import Link from "next/link";

export function Footer() {
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // wire up newsletter later (backend)
  }

  return (
    <footer className="mt-16 border-t bg-card">
      <div className="wrap grid gap-10 py-12 md:grid-cols-4">
        {" "}
        <div>
          <div className="text-xl font-extrabold text-primary">UstaadLink</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Connecting students with trusted tutors and Quran teachers across
            the globe.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} UstaadLink. All rights reserved.
          </p>
        </div>
        <FooterCol
          title="Quick Links"
          links={[
            ["About", "/about"],
            ["Teachers", "/teachers"],
            ["Courses", "/courses"],
            ["Requests", "/requests"],
            ["Pricing", "/pricing"],
            ["Blog", "/blog"],
            ["Contact", "/contact"],
          ]}
        />
        <FooterCol
          title="Support"
          links={[
            ["FAQ", "/faq"],
            ["Privacy Policy", "/privacy"],
            ["Terms of Service", "/terms"],
          ]}
        />
        <div>
          <h4 className="mb-2 font-semibold">Newsletter</h4>
          <p className="text-sm text-muted-foreground">
            Get tips and updates from our team.
          </p>
          <form className="mt-3 flex gap-2" onSubmit={onSubmit}>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
}

export function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [label: string, href: string][];
}) {
  return (
    <div>
      <h4 className="mb-2 font-semibold">{title}</h4>
      <ul className="space-y-1 text-sm">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="hover:text-primary">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
