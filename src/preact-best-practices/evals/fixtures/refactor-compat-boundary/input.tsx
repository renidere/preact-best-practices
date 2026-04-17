import { signal } from "@preact/signals";
import { lazy } from "preact/compat";

const DebugPanel = lazy(() => import("./DebugPanel"));

export const currentUser = signal<{ id: string } | null>(null);

export function AccountPage({ userId }: { userId: string }) {
  return (
    <div>
      <DebugPanel userId={userId} />
    </div>
  );
}
