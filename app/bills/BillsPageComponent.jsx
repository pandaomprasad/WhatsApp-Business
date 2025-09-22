"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UpdateOrderModal from "@/app/components/modal/UpdateOrderModal"; 
import { Separator } from "@/components/ui/separator";

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

export default function BillsPageComponent() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentSelection, setPaymentSelection] = useState({});

  async function refreshOrders() {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) return setOrders([]);
      const data = await res.json();
      setOrders(data);
    } catch {
      setOrders([]);
    }
  }

  useEffect(() => {
    refreshOrders();
  }, []);

  function calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  }

  async function markAsPaid(order) {
    const paymentMethod = paymentSelection[order._id];
    if (!paymentMethod) {
      alert("Please select a payment method before marking as paid.");
      return;
    }

    await fetch(`/api/orders/${order._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid", paymentMethod }),
    });

    refreshOrders();
    setPaymentSelection((prev) => ({ ...prev, [order._id]: "" }));
  }

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {orders.length === 0 && (
        <p className="col-span-full text-center text-gray-500">No orders yet.</p>
      )}

      {orders.map((order) => (
        <Card
          key={order._id}
          className={`shadow-lg rounded-2xl border
       
           transition hover:shadow-xl`}
        >
          {/* Header */}
          <CardHeader className="flex justify-between items-start">
            <div>
              <CardTitle className="text-sm text-gray-500">
                Order #{order.billNo || "N/A"}
              </CardTitle>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {order.customerName}
              </CardTitle>
              <p className="text-xs text-gray-400 mt-1">
                Table {order.tableNumber} | {formatDateTime(order.createdAt)}
              </p>
            </div>

            <Badge
              variant={order.status === "paid" ? "success" : "destructive"}
              className="capitalize"
            >
              {order.status}
            </Badge>
          </CardHeader>

          {/* Items */}
          <CardContent className="mt-2">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-48 overflow-y-auto">
              {order.items.map((item, i) => (
                <li key={`${item._id || i}`} className="flex justify-between py-2 text-sm text-gray-700 dark:text-gray-300">
                  <span>{item.name} × {item.quantity || 1}</span>
                  <span>₹{item.price * (item.quantity || 1)}</span>
                </li>
              ))}
            </ul>

            <Separator className="my-2"/>

            <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-100">
              <span>Total</span>
              <span className="text-green-600 dark:text-green-400">
                ₹{calculateTotal(order.items)}
              </span>
            </div>

            {order.status === "paid" && order.paymentMethod && (
              <p className="mt-1 text-xs text-gray-500">
                Paid via <span className="font-semibold">{order.paymentMethod}</span>
              </p>
            )}
          </CardContent>

          {/* Footer actions */}
          {order.status !== "paid" && (
            <CardFooter className="flex flex-col gap-2 mt-2">
              <select
                value={paymentSelection[order._id] || ""}
                onChange={(e) =>
                  setPaymentSelection((prev) => ({ ...prev, [order._id]: e.target.value }))
                }
                className="border rounded-lg p-2 text-sm w-full"
              >
                <option value="">Select Payment Method</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
              </select>

              <div className="flex gap-2 justify-end">
                <Button
                  className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                  onClick={() => markAsPaid(order)}
                >
                  Mark as Paid
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrder(order)}
                >
                  View More
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      ))}

      {selectedOrder && (
        <UpdateOrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          refreshOrders={refreshOrders}
        />
      )}
    </div>
  );
}
