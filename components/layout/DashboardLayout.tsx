import * as React from "react";
import { Outlet } from "react-router-dom";

/**
 * Dashboard shell WITHOUT the public Navbar/Footer.
 * Keep this minimal; each dashboard page can render its own header.
 */
export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
