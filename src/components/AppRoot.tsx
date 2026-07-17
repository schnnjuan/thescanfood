"use client";

import { AuthProvider } from "@/components/AuthProvider";

export function AppRoot({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
