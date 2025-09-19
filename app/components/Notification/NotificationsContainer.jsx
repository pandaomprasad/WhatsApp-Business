"use client";
import { AnimatePresence, motion } from "framer-motion";
import { AlertBox } from "@/app/components/alert/alert";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationsContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <AlertBox
              type={n.type}
              title={n.title}
              description={n.description}
              // 👇 optional close button if you want
              onClose={() => removeNotification(n.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
