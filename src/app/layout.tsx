import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { RoleProvider } from "@/components/providers/role-context";
import { ReviewProvider } from "@/components/providers/review-context";
import "./globals.css";

export const metadata: Metadata = { title: "Industry Risk Copilot", description: "An industry risk case-review workspace." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><RoleProvider><ReviewProvider><AppShell>{children}</AppShell></ReviewProvider></RoleProvider></body>
    </html>
  );
}
