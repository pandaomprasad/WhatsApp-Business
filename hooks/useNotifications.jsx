import { useState, useCallback } from "react";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now(); // unique ID
    setNotifications((prev) => [...prev, { id, ...notification }]);

    // auto-remove after 10 min
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 600000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, addNotification, removeNotification };
}
