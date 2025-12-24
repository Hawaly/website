"use client";

import { AuthProvider } from '@/compta-app/contexts/SimpleAuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
