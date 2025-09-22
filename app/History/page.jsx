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
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [showOlder, setShowOlder] = useState(false);

  async function fetchBills() {
    const res = await fetch("/api/bills");
    if (!res.ok) return;
    const data = await res.json();
    setBills(data);
  }

  useEffect(() => {
    fetchBills();
  }, []);

  const today = new Date().toDateString();
  const todaysBills = bills.filter(
    (bill) => new Date(bill.paidAt).toDateString() === today
  );
  const olderBills = bills.filter(
    (bill) => new Date(bill.paidAt).toDateString() !== today
  );
  const renderBillCard = (bill) => (
    <Dialog key={bill._id}>
      <DialogTrigger asChild>
        <Card className="shadow-lg p-4 cursor-pointer hover:shadow-xl transition rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <p className="font-bold text-gray-800 dark:text-gray-100">
              Bill #{bill.billNo || "N/A"}
            </p>
            <span className="text-sm text-gray-500">
              {formatDateTime(bill.paidAt)}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            Table {bill.tableNumber} – {bill.customerName}
          </p>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-lg w-full p-6 rounded-3xl shadow-2xl bg-white dark:bg-gray-900">
        {/* Header */}
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-50">
            Bill #{bill.billNo || "N/A"}
          </DialogTitle>
          <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Customer: {bill.customerName}</span>
            <span>Phone: {bill.customerPhone || "N/A"}</span>
            <span>Table: {bill.tableNumber}</span>
            <span>
              Payment:{" "}
              <span className="font-semibold">{bill.paymentMethod}</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {formatDateTime(bill.paidAt)}
          </p>
        </DialogHeader>

        {/* Items Table */}
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Items Ordered
          </h4>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
            {bill.items.map((item, i) => (
              <div
                key={`${item._id || i}`}
                className="flex justify-between py-2 text-gray-700 dark:text-gray-300"
              >
                <span>
                  {item.name} × {item.quantity || 1}
                </span>
                <span>₹{item.price * (item.quantity || 1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 text-gray-700 dark:text-gray-300">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal</span>
            <span>₹{bill.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">GST</span>
            <span>₹{bill.gst}</span>
          </div>
          <div className="flex justify-between font-bold text-xl text-green-600 dark:text-green-400 mt-2">
            <span>Total</span>
            <span>₹{bill.grandTotal}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition cursor-pointer">
            Send via WhatsApp
          </Button>
          <Button className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition cursor-pointer">
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">Today's Bills</h2>
      <div className="max-h-[400px] overflow-y-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {todaysBills.length === 0 && <p>No bills for today.</p>}
        {todaysBills.map(renderBillCard)}
      </div>

      {olderBills.length > 0 && (
        <div className="mt-6">
          <button
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
            onClick={() => setShowOlder(!showOlder)}
          >
            {showOlder ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showOlder
              ? "Hide older bills"
              : `Show older bills (${olderBills.length})`}
          </button>

          {showOlder && (
            <div className="max-h-[400px] overflow-y-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
              {olderBills.map(renderBillCard)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
