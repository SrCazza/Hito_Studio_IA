import { AppShell } from "@/components/panel/AppShell";
import { BatchProgress } from "@/components/panel/BatchProgress";

export default function BatchesLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <BatchProgress />
      {children}
    </AppShell>
  );
}
