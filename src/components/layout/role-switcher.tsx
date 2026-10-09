"use client";
import { useId } from "react";
import { useRouter } from "next/navigation";
import { roles, type Role, useRole } from "@/components/providers/role-context";
import { ChevronDownIcon } from "./icons";
export function RoleSwitcher() { const { role, setRole } = useRole(); const router = useRouter(); const selectId = useId(); return <div className="relative"><label htmlFor={selectId} className="sr-only">Demo role</label><select id={selectId} value={role} onChange={(event) => { const nextRole = event.target.value as Role; if (nextRole !== role) { setRole(nextRole); router.push("/reviews"); } }} className="h-9 w-full appearance-none rounded-lg border border-border bg-surface py-0 pl-3 pr-9 text-sm font-medium text-foreground shadow-sm transition hover:border-[#cbd2dc] sm:w-[280px]">{roles.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" /></div>; }
