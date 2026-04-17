import { useEffect, useState } from "preact/hooks";

async function fetchUser() {
  return { id: "u1", name: "Ada" };
}

async function fetchConfig() {
  return { theme: "dark" };
}

async function fetchFlags() {
  return { betaDashboard: true };
}

export function SettingsScreen() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const user = await fetchUser();
      const config = await fetchConfig();
      const flags = await fetchFlags();

      setData({ user, config, flags });
    }

    void load();
  }, []);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
