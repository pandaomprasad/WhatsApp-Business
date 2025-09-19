"use client";

import { useParams } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, ShoppingCart, User, ChevronUp, ChevronDown } from "lucide-react";

import DataTable from "@/app/components/table/DataTable";
import { foodItems } from "@/Food_data";
import { getFoodColumns } from "@/Food_column";
import Modal from "@/app/components/modal/modal";

import { useSelector, useDispatch } from "react-redux";
import { updateCustomerOrders, setSelectedTableId } from "@/store/hotelSlice";

export default function GiveOrderPage() {
  const { slug } = useParams(); // table id from URL
  const tableId = parseInt(slug, 10);

  const dispatch = useDispatch();
  const { hotel, selectedCustomer, selectedTableId } = useSelector(
    (state) => state.hotel
  );

  // ✅ Keep Redux tableId in sync with URL param
  useEffect(() => {
    if (selectedTableId !== tableId) {
      dispatch(setSelectedTableId(tableId));
    }
  }, [dispatch, tableId, selectedTableId]);

  // ✅ Always get table & customer by URL tableId
  const currentTable = hotel.tables.find((t) => t.table_id === tableId);
  const currentCustomer = currentTable?.customers.find(
    (c) => c.customer_name === selectedCustomer
  );

  const previousOrders = currentCustomer?.orders || [];

  // Build locked orders (already ordered items)
  const lockedItems = {};
  const lockedItemIds = new Set();

  previousOrders.forEach((order) => {
    const item = foodItems.find((f) => f.name === order.item);
    if (item) {
      lockedItems[item.id] = (lockedItems[item.id] || 0) + order.quantity;
      lockedItemIds.add(item.id);
    }
  });

  const lockedSummary = foodItems
    .filter((item) => lockedItems[item.id] > 0)
    .map((item) => ({
      ...item,
      quantity: lockedItems[item.id],
      total: (item.price * lockedItems[item.id]).toFixed(2),
    }));

  // State
  const [addedItems, setAddedItems] = useState({});
  const [showLockedOrders, setShowLockedOrders] = useState(true);
  const [showNewOrders, setShowNewOrders] = useState(true);

  const lockedRef = useRef(null);
  const newRef = useRef(null);
  const newItemRefs = useRef({});

  // Expand locked orders
  useEffect(() => {
    if (lockedRef.current && showLockedOrders) {
      lockedRef.current.style.maxHeight = `${lockedRef.current.scrollHeight}px`;
    }
  }, [lockedSummary, showLockedOrders]);

  // Qty controls
  const increaseQty = (id) => {
    setAddedItems((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decreaseQty = (id) => {
    if (lockedItemIds.has(id) && (!addedItems[id] || addedItems[id] <= 0)) return;

    setAddedItems((prev) => {
      if (!prev[id]) return prev;
      const updated = { ...prev, [id]: prev[id] - 1 };
      if (updated[id] <= 0) delete updated[id];
      return updated;
    });
  };

  const clearAddedItems = () => setAddedItems({});

  // Build new summary
  const newSummary = foodItems
    .filter((item) => addedItems[item.id] > 0)
    .map((item) => ({
      ...item,
      quantity: addedItems[item.id],
      total: (item.price * addedItems[item.id]).toFixed(2),
    }));

  // Totals
  const calculateTotal = () => {
    const subtotal = [...lockedSummary, ...newSummary].reduce(
      (sum, item) => sum + parseFloat(item.total),
      0
    );
    const gst = subtotal * 0.05;
    return { subtotal, gst, final: subtotal + gst };
  };

  const { subtotal, gst, final } = calculateTotal();
  const columns = getFoodColumns({
    lockedItems,
    addedItems,
    lockedItemIds,
    increaseQty,
    decreaseQty,
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePlaceOrder = () => setIsModalOpen(true);

  const handleConfirmOrder = () => {
    const newOrdersArray = Object.entries(addedItems)
      .map(([id, qty]) => {
        const item = foodItems.find((f) => f.id === parseInt(id, 10));
        if (!item) return null;
        return { item: item.name, price: item.price, quantity: qty };
      })
      .filter(Boolean);

    if (newOrdersArray.length > 0) {
      dispatch(
        updateCustomerOrders({
          tableId, // ✅ from URL
          customerName: selectedCustomer,
          newOrders: newOrdersArray, // ✅ only pass new orders
        })
      );
    }

    setAddedItems({});
    setIsModalOpen(false);
    alert("✅ Order placed successfully!");
  };

  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-full mx-auto block">
        {/* Header */}
        <div className="mb-6 w-full">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight">
              {selectedCustomer || "New Order"}
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="text-base px-3 py-1">
              <User className="h-4 w-4 mr-1" />
              Table {slug}
            </Badge>
          </div>
        </div>

        {/* Main */}
        <div className="flex gap-4">
          {/* Food Menu */}
          <div className="flex-1">
            <Card className="shadow-none border rounded-2xl overflow-hidden">
              <CardContent>
                <DataTable data={foodItems} columns={columns} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-card backdrop-blur-md border rounded-2xl shadow-2xl p-6 flex flex-col h-[71vh] sticky top-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 flex-shrink-0">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Order Summary</h3>
            </div>

            {/* Order Lists */}
            <div className="flex-1 overflow-y-auto space-y-6">
              {/* Locked Orders */}
              {lockedSummary.length > 0 ? (
                <div>
                  <button
                    className="flex justify-between w-full items-center mb-2 text-sm font-semibold text-muted-foreground"
                    onClick={() => setShowLockedOrders(!showLockedOrders)}
                  >
                    <span>Already Ordered</span>
                    {showLockedOrders ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300"
                    ref={lockedRef}
                  >
                    {showLockedOrders &&
                      lockedSummary.map((item) => (
                        <div
                          key={`locked-${item.id}`}
                          className="flex justify-between items-center py-2 border-b border-border last:border-b-0"
                        >
                          <span className="text-foreground font-medium text-sm">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-bold text-foreground">₹{item.total}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No previous orders</p>
                </div>
              )}

              {/* New Orders */}
              {newSummary.length > 0 ? (
                <div>
                  <button
                    className="flex justify-between w-full items-center mb-2 text-sm font-semibold text-muted-foreground"
                    onClick={() => setShowNewOrders(!showNewOrders)}
                  >
                    <span>New Orders</span>
                    {showNewOrders ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight: showNewOrders
                        ? `${newRef.current?.scrollHeight || 0}px`
                        : "0px",
                    }}
                    ref={newRef}
                  >
                    {newSummary.map((item) => {
                      if (!newItemRefs.current[item.id])
                        newItemRefs.current[item.id] = React.createRef();

                      return (
                        <div
                          key={`new-${item.id}`}
                          className="flex justify-between items-center py-2 border-b border-border last:border-b-0"
                          ref={newItemRefs.current[item.id]}
                        >
                          <span className="text-foreground font-medium text-sm">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-bold text-foreground">₹{item.total}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No new items added</p>
                </div>
              )}

              {/* Empty State */}
              {lockedSummary.length === 0 && newSummary.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No items added yet</p>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-border pt-4 mt-4 flex-shrink-0 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>GST (5%):</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total:</span>
                <span className="text-primary">₹{final.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 mt-4 flex-shrink-0">
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => {
                  clearAddedItems();
                  setShowLockedOrders(true);
                  setShowNewOrders(false);
                }}
              >
                Clear Added Items
              </Button>

              <Button
                size="sm"
                className="w-full"
                disabled={newSummary.length === 0}
                onClick={handlePlaceOrder}
              >
                Place Order
              </Button>
            </div>
          </div>

          {/* Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onConfirm={handleConfirmOrder}
            title="Confirm Order"
            cancelText="Cancel"
            confirmText="Place Order"
          >
            <p>Are you sure you want to place this order?</p>
            <p className="mt-2 font-semibold">Total: ₹{final.toFixed(2)}</p>
          </Modal>
        </div>
      </div>
    </div>
  );
}
