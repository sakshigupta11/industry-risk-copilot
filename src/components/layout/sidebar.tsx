"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRole } from "@/components/providers/role-context";
import { CasesIcon, PlusIcon } from "./icons";
const navigation = [
  { href: "/", label: "Analyze Company", icon: PlusIcon },
  { href: "/reviews", label: "Review Queue", icon: CasesIcon },
  { href: "/reviews?tab=completed", label: "Completed Reviews", icon: CasesIcon },
];
export function Sidebar() { const pathname = usePathname(); const searchParams = useSearchParams(); const { role } = useRole(); return <aside className="flex w-full shrink-0 flex-col border-b border-border bg-navy text-white md:min-h-screen md:w-60 md:border-b-0 md:border-r md:border-[#24416f]"><div className="flex h-16 items-center gap-3 border-b border-[#24416f] px-5"><div className="flex size-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-navy shadow-sm">IR</div><span className="font-semibold tracking-tight">Industry Risk</span></div><nav aria-label="Primary navigation" className="flex gap-1 overflow-x-auto px-3 py-3 md:block md:space-y-1">{navigation.map(({ href, label, icon: Icon }) => { const isActive = href === "/" ? pathname === "/" : href.includes("completed") ? pathname === "/reviews" && searchParams.get("tab") === "completed" : pathname === "/reviews" && searchParams.get("tab") !== "completed" || /^\/reviews\/[^/]+$/.test(pathname); return <Link key={href} href={href} className={`flex h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${isActive ? "bg-white/14 text-white" : "text-[#c8d5ea] hover:bg-white/8 hover:text-white"}`}><Icon className="size-[18px]" />{label}</Link>; })}</nav><div className="hidden border-t border-[#24416f] p-4 md:mt-auto md:block"><p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#9db2d0]">Current role</p><p className="mt-1.5 text-sm font-medium text-white">{role}</p></div></aside>; }
