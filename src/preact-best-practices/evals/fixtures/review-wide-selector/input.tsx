import { useEffect, useState } from "preact/hooks";
import { useDashboardStore } from "./store";

export function DashboardSummary() {
  const store = useDashboardStore();
  const [isLarge, setIsLarge] = useState(false);

  useEffect(() => {
    setIsLarge(store.metrics.length > 20);
  }, [store]);

  return (
    <section>
      <h2>{store.title}</h2>
      <p>{isLarge ? "Large dashboard" : "Small dashboard"}</p>
      <span>{store.metrics.length}</span>
    </section>
  );
}
