import { Suspense } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
export function AppShell({ children }: { children: React.ReactNode }) { return <div className="min-h-screen bg-background md:flex"><Suspense fallback={<aside className="hidden w-60 bg-navy md:block" />}><Sidebar /></Suspense><div className="flex min-h-screen min-w-0 flex-1 flex-col"><TopBar /><main className="flex-1 p-5 sm:p-8">{children}</main></div></div>; }
