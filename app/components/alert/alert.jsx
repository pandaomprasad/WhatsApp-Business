"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircleIcon, CheckCircle2Icon, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AlertBox({ type = "success", title, description, onClose }) {
  const isSuccess = type === "success";

  const icon = isSuccess ? (
    <CheckCircle2Icon className="h-5 w-5 text-green-500" />
  ) : (
    <AlertCircleIcon className="h-5 w-5 text-red-500" />
  );

  const bgColor = isSuccess ? "bg-green-50 dark:bg-green-900" : "bg-red-50 dark:bg-red-900";
  const textColor = isSuccess ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300";

  return (
    <AnimatePresence>
      {title && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className={`flex items-start gap-2 p-4 ${bgColor} ${textColor} rounded-lg shadow-md`}
        >
          {icon}
          <div className="flex flex-col flex-1">
            <AlertTitle className="font-semibold">{title}</AlertTitle>
            <AlertDescription>{description}</AlertDescription>
          </div>
          {onClose && (
            <button onClick={onClose} className="ml-2 text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
