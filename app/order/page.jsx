"use client";

import { useState, useEffect } from "react";

export default function OrderPage() {
  const [bills, setBills] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  const tables = [1, 2, 3, 4, 5]; // table IDs hard-coded

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBills(data.bills || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createBill = async () => {
    if (!selectedTable) return alert("Select a table first!");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "createBill", tableId: Number(selectedTable) }),
      });
      if (!res.ok) {
        const error = await res.json();
        return alert(error.error || "Failed to create bill");
      }
      setSelectedTable("");
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const addOrder = async (billNo) => {
    if (!item || !price) return alert("Enter item and price!");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "addOrder",
          billNo,
          item,
          price: Number(price),
          quantity: Number(qty),
        }),
      });
      if (!res.ok) throw new Error("Failed to add order");
      setItem("");
      setPrice("");
      setQty(1);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const payBill = async (billNo) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "payBill", billNo }),
      });
      if (!res.ok) throw new Error("Failed to pay bill");
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="font-bold text-2xl mb-4">🍽️ New Order</h2>

      <div className="mb-6 flex items-center gap-3">
        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">--Select Table--</option>
          {tables.map((id) => {
            const isOccupied = bills.some(
              (b) => b.tableId === id && b.status === "active"
            );
            return (
              <option key={id} value={id} disabled={isOccupied}>
                Table {id} {isOccupied ? "(Reserved)" : ""}
              </option>
            );
          })}
        </select>

        <button
          onClick={createBill}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Create Bill
        </button>
      </div>

      <h3 className="font-semibold mb-2">Active Bills</h3>
      {loading && <p>Loading...</p>}

      <div className="space-y-4">
        {bills
          .filter((b) => b.status === "active")
          .map((bill) => (
            <div key={bill.billNo} className="border p-4 rounded bg-gray-50">
              <h4 className="font-bold">
                Bill: {bill.billNo} | Table {bill.tableId}
              </h4>

              <ul className="mt-2">
                {bill.orders.map((o, i) => (
                  <li key={i}>
                    {o.item} - {o.quantity} × ₹{o.price} = ₹
                    {o.price * o.quantity}
                  </li>
                ))}
              </ul>

              <p className="font-semibold mt-2">Total: ₹{bill.total}</p>

              <div className="flex gap-2 mt-2 items-center">
                <input
                  placeholder="Item"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  className="border p-1 rounded"
                />
                <input
                  placeholder="Price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="border p-1 rounded w-20"
                />
                <input
                  placeholder="Qty"
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="border p-1 rounded w-16"
                />
                <button
                  onClick={() => addOrder(bill.billNo)}
                  className="px-3 py-1 bg-green-500 text-white rounded"
                >
                  Add
                </button>
                <button
                  onClick={() => payBill(bill.billNo)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Pay
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
