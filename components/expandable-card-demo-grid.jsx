"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { Plus, CreditCard, IndianRupee } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AlertDialogBox } from "@/app/components/alert/alert-dialog";
import { AlertBox } from "@/app/components/alert/alert";
import Modal from "@/app/components/modal/modal";

import { selectCustomer } from "@/store/hotelSlice";

export default function ExpandableCardDemo({ collapsed }) {
  const [active, setActive] = useState(null);
  const id = useId();
  const ref = useRef(null);
  const [alert, setAlert] = useState(null);
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  // ✅ Redux store se latest hotel data
  const hotelState = useSelector((state) => state.hotel);
  const { hotel } = hotelState || { hotel: [] };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setActive(false);
    };

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  // ✅ Build cards array from Redux store
  const cards =
    hotel?.tables?.flatMap((table) =>
      table.customers.map((customer) => ({
        title: `Table ${table.table_id}`,
        cus_name: customer.customer_name,
        total_bill: `Total Bill : ₹${customer.total_bill}`,
        gst_percentage: customer.gst_percentage,
        gst_amount: `GST ${customer.gst_percentage}% : ₹${customer.gst_amount}`,
        final_bill: `Final Bill : ₹${customer.final_bill}`,
        orders: customer.orders || [], // fallback empty array
        content: () => (
          <div>
            <p>
              <strong>Orders:</strong>
            </p>
            <ul className="list-disc ml-5">
              {(customer.orders || []).map((order, idx) => (
                <li key={idx}>
                  {order.item} - ₹{order.price} × {order.quantity} = ₹
                  {(order.price * order.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        ),
      }))
    ) || []; // fallback empty array if hotel.tables undefined

  const handlePayment = () => {
    setAlert({
      type: "success",
      title: "Payment Successful",
      description: `Your payment of ₹${active.final_bill} was processed successfully.`,
    });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleConfirm = () => setOpen(false);

  return (
    <>
      <AnimatePresence>
        {alert && (
          <AlertBox
            type={alert.type}
            title={alert.title}
            description={alert.description}
          />
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>

      {/* Expanded Card */}
      <AnimatePresence>
        {active && typeof active === "object" && (
          <div className="fixed inset-0 grid place-items-center z-[50]">
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <div>
                <div className="flex justify-between items-start p-4 border-b">
                  <div>
                    <motion.h3
                      layoutId={`title-${active.title}`}
                      className="scroll-m-20 text-2xl font-semibold tracking-tight"
                    >
                      <Badge className="border border-gray-400 bg-transparent text-black dark:text-white px-3">
                        {active.title}
                      </Badge>
                    </motion.h3>
                    <motion.h1
                      layoutId={`title-${active.cus_name}`}
                      className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance py-2"
                    >
                      {active.cus_name}
                    </motion.h1>
                    <motion.code
                      layoutId={`description-${active.final_bill}-${id}`}
                      className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-lg font-semibold"
                    >
                      {active.final_bill}
                    </motion.code>
                    <motion.p
                      layoutId={`description-${active.total_bill}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400 text-sm font-semibold px-[0.3rem] py-[0.2rem]"
                    >
                      {active.total_bill}
                    </motion.p>
                    <motion.p
                      layoutId={`description-${active.gst_amount}-${id}`}
                      className="text-muted-foreground text-sm px-[0.3rem]"
                    >
                      {active.gst_amount}
                    </motion.p>
                  </div>

                  <div className="flex gap-2 flex-col">
                    <AlertDialogBox
                      title="Confirm Payment"
                      cancelText="Cancel"
                      actionText="Done"
                      onConfirm={handlePayment}
                      trigger={
                        <Button
                          variant={"outline"}
                          className="rounded-lg py-5 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
                        >
                          <IndianRupee /> Cash
                        </Button>
                      }
                    />

                    <Button
                      variant={"outline"}
                      className="rounded-lg py-5 bg-green-100 dark:hover:bg-neutral-800 cursor-pointer text-green-700 border-green-100"
                    >
                      <CreditCard /> Pay Online
                    </Button>
                  </div>
                </div>

                <div className="relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-row justify-between items-start gap-4 overflow-auto dark:text-neutral-400 [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    <div>
                      {typeof active.content === "function"
                        ? active.content()
                        : active.content}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Card List */}
      <ul className="mx-auto w-full max-w-2xl md:max-w-4xl lg:max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-start gap-4 md:gap-6">
        {cards.map((card) => (
          <motion.div
            layoutId={`card-${card.title}-${id}`}
            key={card.title}
            onClick={() => setActive(card)}
            className="p-4 flex flex-col bg-black hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer min-h-[150px] gap-4 justify-center items-center"
          >
            <div className="flex flex-col justify-center items-center md:flex-row">
              <div className="flex flex-col justify-center items-center">
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  className="font-medium text-white dark:text-neutral-200 text-center text-base"
                >
                  {card.title}
                </motion.h3>
                <motion.p
                  layoutId={`description-${card.description}-${id}`}
                  className="text-neutral-400 text-center text-base"
                >
                  {card.final_bill}
                </motion.p>
              </div>
            </div>
          </motion.div>
        ))}
      </ul>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Action"
        cancelText="No"
        confirmText="Yes"
      >
        <p>Are you sure you want to perform this action?</p>
      </Modal>
    </>
  );
}
