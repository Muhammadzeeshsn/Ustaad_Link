import * as React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";

export default function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      {/* Smoothly scroll to top when the route changes */}
      <ScrollToTop />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
