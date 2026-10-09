"use client";
import { createContext, useContext, useState } from "react";
export const roles = ["Tier 1 Analyst", "Senior FinCrime Reviewer", "Escalation Specialist"] as const;
export type Role = (typeof roles)[number];
type RoleContextValue = { role: Role; setRole: (role: Role) => void };
const RoleContext = createContext<RoleContextValue | undefined>(undefined);
export function RoleProvider({ children }: { children: React.ReactNode }) { const [role, setRole] = useState<Role>(roles[0]); return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>; }
export function useRole() { const context = useContext(RoleContext); if (!context) throw new Error("useRole must be used within a RoleProvider."); return context; }
