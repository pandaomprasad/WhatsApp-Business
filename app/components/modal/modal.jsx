"use client"

import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title = "Modal Title",
  cancelText = "Cancel",
  confirmText = "Confirm",
  children,
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  {title}
                </Dialog.Title>
                <div className="mt-4">{children}</div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>
                    {cancelText}
                  </Button>
                  <Button onClick={onConfirm}>{confirmText}</Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
