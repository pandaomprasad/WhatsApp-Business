// store/orderSlice.js
import { createSlice } from "@reduxjs/toolkit";

let billCounter = 1;

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    tables: Array.from({ length: 5 }, (_, i) => ({
      tableId: i + 1,
      status: "free",
      currentBill: null,
    })),
    bills: [],
  },
  reducers: {
    createBill: (state, action) => {
      const { tableId } = action.payload;
      const billNo = `BILL-${billCounter++}`;

      state.tables = state.tables.map((t) =>
        t.tableId === tableId
          ? { ...t, status: "occupied", currentBill: billNo }
          : t
      );

      state.bills.push({
        billNo,
        tableId,
        orders: [],
        total: 0,
        status: "active",
      });
    },
    addOrder: (state, action) => {
      const { billNo, item, price, quantity } = action.payload;
      const bill = state.bills.find((b) => b.billNo === billNo);

      if (bill) {
        const existing = bill.orders.find((o) => o.item === item);
        if (existing) {
          existing.quantity += quantity;
        } else {
          bill.orders.push({ item, price, quantity });
        }
        bill.total = bill.orders.reduce(
          (sum, o) => sum + o.price * o.quantity,
          0
        );
      }
    },
    payBill: (state, action) => {
      const { billNo } = action.payload;
      const bill = state.bills.find((b) => b.billNo === billNo);

      if (bill) {
        bill.status = "paid";
        state.tables = state.tables.map((t) =>
          t.currentBill === billNo
            ? { ...t, status: "free", currentBill: null }
            : t
        );
      }
    },
  },
});

export const { createBill, addOrder, payBill } = orderSlice.actions;
export default orderSlice.reducer;
