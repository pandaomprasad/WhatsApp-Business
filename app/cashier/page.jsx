"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DataTable from "@/app/components/table/DataTable";

export default function CashierPage() {
  const [admin, setAdmin] = useState(null);
  const [table, setTable] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [lastBill, setLastBill] = useState(null);

  // ✅ New states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const fetchAdmin = async () => {
    const res = await fetch("/api/admin");
    const data = await res.json();
    setAdmin(data);
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  // ✅ Group items by foodId
  const groupedItems = orderItems.reduce((acc, item) => {
    const existing = acc.find((i) => i.foodId === item.foodId);
    if (existing) {
      existing.quantity += 1;
    } else {
      acc.push({
        foodId: item.foodId,
        name: item.name,
        price: item.price,
        quantity: 1,
      });
    }
    return acc;
  }, []);

  // ✅ Place Order
  const placeOrder = async () => {
    if (!table || groupedItems.length === 0) {
      alert("⚠️ Please select a table and add items before placing order.");
      return;
    }
    if (!customerName.trim()) {
      alert("⚠️ Customer name is required.");
      return;
    }
    if (!/^\d{10}$/.test(customerPhone)) {
      alert("⚠️ Enter a valid 10-digit WhatsApp number.");
      return;
    }

    const payload = {
      tableNumber: table,
      items: groupedItems,
      customerName,
      customerPhone: `+91${customerPhone}`,
      subtotal,
      gst,
      grandTotal, // ✅ save final amount
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Order failed. Response:", text);
        alert("Failed to place order!");
        return;
      }

      const data = await res.json();
      console.log("✅ Order success. Response:", data);

      setLastBill(data.billNo);

      // Reset form
      setOrderItems([]);
      setTable("");
      setCustomerName("");
      setCustomerPhone("");

      fetchAdmin();
    } catch (err) {
      console.error("🚨 Error placing order:", err);
      alert("Something went wrong while placing order.");
    }
  };

  // ✅ Columns for DataTable
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span>{row.original.foodId}</span>,
    },
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <span>₹{row.original.price}</span>,
    },
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
        const quantity = orderItems.filter(
          (it) => it.foodId === item.foodId
        ).length;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                setOrderItems((prev) => {
                  const idx = prev.findIndex((p) => p.foodId === item.foodId);
                  if (idx !== -1) {
                    const newItems = [...prev];
                    newItems.splice(idx, 1);
                    return newItems;
                  }
                  return prev;
                })
              }
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
              onClick={() => setOrderItems((prev) => [...prev, item])}
            >
              +
            </Button>
          </div>
        );
      },
    },
  ];

  const subtotal = groupedItems.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );
  const gst = subtotal * 0.05; // 5% GST
  const grandTotal = subtotal + gst;

  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      {/* Left side → Menu */}
      <div className="col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Select Table</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={table}
              onChange={(e) => setTable(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              <option value="">-- Select --</option>
              {admin?.tables?.map((t) => (
                <option
                  key={t.tableNumber}
                  value={t.tableNumber}
                  disabled={t.status === "occupied"}
                >
                  Table {t.tableNumber} ({t.status})
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Menu</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable data={admin?.menu || []} columns={columns} />
          </CardContent>
        </Card>
      </div>

      {/* Right side → Order Preview */}
      <div>
        <Card className="h-[650px] flex flex-col">
          <CardHeader>
            <CardTitle>Order Preview</CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto space-y-4">
            {/* ✅ Customer Info */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border rounded-md p-2"
              />
              <input
                type="text"
                placeholder="WhatsApp Number (10 digits)"
                value={customerPhone}
                onChange={(e) => {
                  // allow only digits
                  const val = e.target.value.replace(/\D/g, "");
                  setCustomerPhone(val.slice(0, 10));
                }}
                className="w-full border rounded-md p-2"
              />
            </div>

            {groupedItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No items added yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {groupedItems.map((it, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center border-b pb-1 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span>{it.name}</span>
                      {it.quantity > 1 && (
                        <span className="text-muted-foreground">
                          x {it.quantity}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>₹{it.price * it.quantity}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>

          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>GST (5%)</span>
              <span>₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Grand Total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>

            {lastBill && (
              <p className="text-sm text-green-600 font-medium">
                ✅ Last Bill: #{lastBill}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOrderItems([])}
                disabled={orderItems.length === 0}
              >
                Clear
              </Button>
              <Button
                className="flex-1"
                onClick={placeOrder}
                disabled={
                  !table ||
                  orderItems.length === 0 ||
                  !customerName ||
                  customerPhone.length !== 10
                }
              >
                Place Order
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
