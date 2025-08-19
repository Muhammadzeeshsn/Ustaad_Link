// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import Providers from './providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'UstaadLink',
  description: 'Find trusted tutors & Quran teachers — fast, safe, verified.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Navbar />
        <Providers>{children}</Providers>
        <Footer />
      </body>
    </html>
  );
}