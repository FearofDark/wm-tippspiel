"use client";

import "./globals.css";
import Sidebar from "@/components/sidebar";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideSidebar =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register";

  return (
    <html lang="de">
      <body className="bg-slate-950 text-white">

        {hideSidebar ? (
          children
        ) : (
          <div className="flex min-h-screen">

            <Sidebar />

            <main className="flex-1 overflow-auto">
              {children}
            </main>

          </div>
        )}

      </body>
    </html>
  );
}