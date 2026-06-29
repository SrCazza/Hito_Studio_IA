import { AppShell } from "@/components/panel/AppShell";

export default function InicioLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
