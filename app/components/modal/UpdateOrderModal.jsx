"use client";
import { useState, useEffect } from "react";
import DataTable from "@/app/components/table/DataTable";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationsContainer } from "@/app/components/Notification/NotificationsContainer";

export default function UpdateOrderModal({ order, onClose, refreshOrders }) {
  const [menuItems, setMenuItems] = useState([]);
  const [changes, setChanges] = useState([]); // ✅ only track deltas
  const { notifications, addNotification, removeNotification } =
    useNotifications();

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then(setMenuItems)
      .catch((err) => console.error("Failed to load menu:", err));
  }, []);

  // ✅ Add item (increase quantity)
  const handleAddItem = (item) => {
    setChanges((prev) => {
      const exists = prev.find((x) => x.foodId === item.foodId);
      if (exists) {
        return prev.map((x) =>
          x.foodId === item.foodId
            ? { ...x, quantity: x.quantity + 1 }
            : x
        );
      }
      return [...prev, { foodId: item.foodId, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  // ✅ Remove item (decrease quantity)
  const handleRemoveItem = (item) => {
    setChanges((prev) => {
      const exists = prev.find((x) => x.foodId === item.foodId);
      if (exists) {
        if (exists.quantity - 1 === 0) {
          return prev.filter((x) => x.foodId !== item.foodId);
        }
        return prev.map((x) =>
          x.foodId === item.foodId
            ? { ...x, quantity: x.quantity - 1 }
            : x
        );
      }
      // If not in changes, push -1 (remove from existing)
      return [...prev, { foodId: item.foodId,name:item.name, quantity: -1 }];
    });
  };

  // ✅ Update order with deltas
  const handleUpdateOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: changes }),
      });

      if (!res.ok) throw new Error("Failed to update order");
      await res.json();

      refreshOrders();
      onClose();
      addNotification({
        type: "success",
        title: "Order Updated",
        description: `Order #${order.billNo} has been updated successfully.`,
      });
    } catch (err) {
      addNotification({
        type: "error",
        title: "Update Failed",
        description: err.message,
      });
    }
  };

  // ✅ Table columns
  const columns = [
    { accessorKey: "foodId", header: "Food ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "price", header: "Price (₹)" },
    { accessorKey: "category", header: "Category" },
    {
      accessorKey: "veg",
      header: "Type",
      cell: ({ row }) =>
        row.original.veg ? (
          <span className="text-green-600">Veg</span>
        ) : (
          <span className="text-red-600">Non-Veg</span>
        ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const item = row.original;

        // ✅ Get current qty = old order qty + delta
        const prevQty =
          order.items.find((x) => x.foodId === item.foodId)?.quantity || 0;
        const delta =
          changes.find((x) => x.foodId === item.foodId)?.quantity || 0;
        const quantity = prevQty + delta;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleRemoveItem(item)}
              disabled={quantity === 0}
            >
              -
            </Button>
            <div className="w-10 text-center border rounded-md py-1 text-sm font-medium">
              {quantity}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleAddItem(item)}
            >
              +
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white w-[95%] max-w-7xl rounded-lg shadow-lg flex h-[90vh]">
          {/* Left: Food Table */}
          <div className="flex-1 p-4 border-r overflow-y-auto max-h-[90vh]">
            <h2 className="text-lg font-semibold mb-4">Select Food Items</h2>
            <DataTable data={menuItems} columns={columns} tableTitle="Menu" />
          </div>

          {/* Right: Order Summary */}
          <div className="w-96 p-4 flex flex-col">
            <h3 className="font-semibold mb-2">Previous Orders</h3>
            {order.items?.map((item, idx) => (
              <div
                key={`${item.foodId}-${idx}-prev`}
                className="flex justify-between text-sm"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>₹{item.price * (item.quantity || 1)}</span>
              </div>
            ))}

            <h3 className="font-semibold mt-4 mb-2">New Changes</h3>
            {changes.length > 0 ? (
              changes.map((item, idx) => (
                <div
                  key={`${item.foodId}-${idx}-new`}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {item.name || "Item"} × {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No changes made</p>
            )}

            <Button
              className="mt-auto"
              onClick={handleUpdateOrder}
              disabled={changes.length === 0}
            >
              Update Order
            </Button>
            <Button variant="outline" className="mt-2" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <NotificationsContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </>
  );
}
