// store/hotelSlice.js
import { createSlice } from "@reduxjs/toolkit";
import hotelData from "@/taj_hotel_data";

const initialState = {
  hotel: hotelData.hotel,
  selectedCustomer: null,
  selectedTableId: null,
};

export const hotelSlice = createSlice({
  name: "hotel",
  initialState,
  reducers: {
    // ✅ Select both customer and table at once
    selectCustomer: (state, action) => {
      state.selectedCustomer = action.payload.customer;
      state.selectedTableId = action.payload.tableId;
    },

    // ✅ NEW: Only update table id (used when syncing from route slug)
    setSelectedTableId: (state, action) => {
      state.selectedTableId = action.payload;
    },

    // ✅ Update orders for a customer in a table
    updateCustomerOrders: (state, action) => {
      const { tableId, customerName, newOrders } = action.payload;

      const table = state.hotel.tables.find((t) => t.table_id === tableId);
      if (!table) return;

      const customer = table.customers.find(
        (c) => c.customer_name === customerName
      );
      if (!customer) return;

      // Merge new orders with existing ones
      newOrders.forEach((order) => {
        const existingOrder = customer.orders.find((o) => o.item === order.item);
        if (existingOrder) {
          existingOrder.quantity += order.quantity;
        } else {
          customer.orders.push(order);
        }
      });

      // Recalculate totals
      const total = customer.orders.reduce(
        (sum, o) => sum + o.price * o.quantity,
        0
      );
      const gstAmount = +(total * (customer.gst_percentage / 100)).toFixed(2);

      customer.total_bill = total;
      customer.gst_amount = gstAmount;
      customer.final_bill = +(total + gstAmount).toFixed(2);
    },
  },
});

// ✅ Named exports for actions
export const { selectCustomer, setSelectedTableId, updateCustomerOrders } =
  hotelSlice.actions;

// ✅ Default export for reducer
export default hotelSlice.reducer;
