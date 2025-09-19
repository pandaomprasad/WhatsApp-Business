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
import UpdateOrderModal from "@/app/components/modal/UpdateOrderModal"; // 👈 if you moved modal out
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

export default function BillsPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  async function refreshOrders() {
    try {
      const res = await fetch("/api/orders");

      if (!res.ok) {
        console.error("❌ Failed to fetch orders:", res.status);
        setOrders([]);
        return;
      }

      const text = await res.text(); // read raw text first
      if (!text) {
        console.warn("⚠️ Empty response from /api/orders");
        setOrders([]);
        return;
      }

      const data = JSON.parse(text);
      setOrders(data);
    } catch (err) {
      console.error("🚨 Error parsing orders:", err);
      setOrders([]);
    }
  }

  useEffect(() => {
    refreshOrders();
  }, []);

  function calculateTotal(items) {
    return items.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
  }

  async function markAsPaid(id) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid" }),
    });
    refreshOrders();
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
            <Separator/>

            <p className="mt-3 font-semibold flex justify-between">
              <span>Total:</span>
              <span className="text-green-500 font-bold">₹{calculateTotal(order.items)}</span>
            </p>
          </CardContent>

          <CardFooter className="gap-3">
            {order.status !== "paid" && (
              <>
                <Button onClick={() => markAsPaid(order._id)}>
                  Mark as Paid
                </Button>
                <Button onClick={() => setSelectedOrder(order)}>
                  View More
                </Button>
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
