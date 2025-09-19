"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function formatDateTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function BillsHistoryPage() {
  const [bills, setBills] = useState([]);

  async function fetchBills() {
    const res = await fetch("/api/bills");
    if (!res.ok) return;
    const data = await res.json();
    setBills(data);
  }

  useEffect(() => {
    fetchBills();
  }, []);

  // function calculateTotal(items) {
  //   return items.reduce(
  //     (sum, item) => sum + item.price * (item.quantity || 1),
  //     0
  //   );
  // }

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {bills.length === 0 && <p>No bills yet.</p>}

      {bills.map((bill) => (
        <Dialog key={bill._id}>
          <DialogTrigger asChild>
            <Card className="shadow-md p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <p className="font-semibold">Bill #{bill.billNo || "N/A"}</p>
            </Card>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Bill #{bill.billNo || "N/A"} – {bill.customerName}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-2">
              <p className="font-semibold">Table {bill.tableNumber}</p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(bill.paidAt)}
              </p>

              <ul className="space-y-1 mb-3">
                {bill.items.map((item, i) => (
                  <li
                    key={`${item._id || i}`}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {item.name} × {item.quantity || 1}
                    </span>
                    <span>₹{item.price * (item.quantity || 1)}</span>
                  </li>
                ))}
              </ul>

              <Separator />

              <p className="mt-3 font-semibold flex flex-col">
                <span>{bill.subtotal}</span>
                <span>{bill.gst}</span>
                <span>Total:</span>
                <span className="text-green-500 font-bold">
                  ₹{bill.grandTotal}
                </span>
              </p>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
