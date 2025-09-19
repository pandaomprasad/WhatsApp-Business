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
  const [paymentSelection, setPaymentSelection] = useState({}); // track selected payment per order

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
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {orders.length === 0 && <p>No orders yet.</p>}

      {orders.map((order) => (
        <Card key={order._id} className="shadow-md">
          <CardHeader className="flex flex-row justify-between items-center">
            <div className="flex flex-col">
              <CardTitle className={"text-xs"}>Order #{order.billNo || "N/A"}</CardTitle>
              <CardTitle className={"text-xl"}>{order.customerName}</CardTitle>
            </div>
            <Badge
              variant={order.status === "paid" ? "success" : "destructive"}
              className="capitalize"
            >
              {order.status}
            </Badge>
          </CardHeader>

          <CardContent>
            <p className="font-semibold mb-1">Table {order.tableNumber}</p>
            <p className="text-xs text-muted-foreground mb-3">
              {formatDateTime(order.createdAt)}
            </p>

            <ul className="space-y-1 mb-3">
              {order.items.map((item, i) => (
                <li key={`${item._id || i}`} className="flex justify-between text-sm">
                  <span>{item.name} × {item.quantity || 1}</span>
                  <span>₹{item.price * (item.quantity || 1)}</span>
                </li>
              ))}
            </ul>
            <Separator/>
            <p className="mt-3 font-semibold flex justify-between">
              <span>Total:</span>
              <span className="text-green-500 font-bold">₹{calculateTotal(order.items)}</span>
            </p>

            {order.status === "paid" && order.paymentMethod && (
              <p className="text-sm text-muted-foreground mt-1">
                Paid via: <span className="font-semibold">{order.paymentMethod}</span>
              </p>
            )}
          </CardContent>

          <CardFooter className="gap-3 flex flex-col">
            {order.status !== "paid" && (
              <>
                <select
                  value={paymentSelection[order._id] || ""}
                  onChange={(e) =>
                    setPaymentSelection((prev) => ({ ...prev, [order._id]: e.target.value }))
                  }
                  className="border rounded p-1"
                >
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                </select>

                <div className="flex gap-2">
                  <Button onClick={() => markAsPaid(order)}>Mark as Paid</Button>
                  <Button onClick={() => setSelectedOrder(order)}>View More</Button>
                </div>
              </>
            )}
          </CardFooter>
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
