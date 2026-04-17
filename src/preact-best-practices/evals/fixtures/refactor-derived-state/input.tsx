import { useEffect, useState } from "preact/hooks";

type Props = {
  notifications: string[];
  onOpenPanel: () => void;
};

export function NotificationBadge({ notifications, onOpenPanel }: Props) {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    setHasUnread(notifications.length > 0);
  }, [notifications]);

  useEffect(() => {
    if (hasUnread) {
      onOpenPanel();
    }
  }, [hasUnread, onOpenPanel]);

  return <button>{hasUnread ? "Unread" : "All caught up"}</button>;
}
