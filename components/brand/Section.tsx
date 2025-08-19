import * as React from 'react';
import { cn } from '@/lib/utils';

export function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('relative', className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />
      <div className="container py-14 md:py-20">{children}</div>
    </section>
  );
}
