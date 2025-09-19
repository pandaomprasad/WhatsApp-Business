import { foodItems } from "./Food_data";

const GST_RATE = 5; // 5%

// Helper function to calculate bill
function calculateBill(orders) {
  const total = orders.reduce((sum, item) => sum + item.price, 0);
  const gstAmount = +(total * GST_RATE / 100).toFixed(2);
  const finalBill = +(total + gstAmount).toFixed(2);
  return { total, gstAmount, finalBill };
}

// Create hotel data using foodItems
const hotelData = {
  hotel: {
    name: "Taj Hotel",
    total_tables: 10,
    tables: [
      {
        table_id: 1,
        customers: [
          (() => {
            const orders = [
              foodItems[0], // Margherita Pizza
              foodItems[3], // Veggie Sandwich
              foodItems[9], // Chocolate Cake
            ].map(f => ({ item: f.name, price: f.price }));

            const { total, gstAmount, finalBill } = calculateBill(orders);

            return {
              customer_name: "Nisha Chauhan",
              orders,
              total_bill: total,
              gst_percentage: GST_RATE,
              gst_amount: gstAmount,
              final_bill: finalBill,
            };
          })(),
        ],
      },
      {
        table_id: 2,
        customers: [
          (() => {
            const orders = [
              foodItems[1], // Chicken Burger
              foodItems[7], // Veg Biryani
            ].map(f => ({ item: f.name, price: f.price }));

            const { total, gstAmount, finalBill } = calculateBill(orders);

            return {
              customer_name: "Anjali Sharma",
              orders,
              total_bill: total,
              gst_percentage: GST_RATE,
              gst_amount: gstAmount,
              final_bill: finalBill,
            };
          })(),
        ],
      },
      {
        table_id: 3,
        customers: [
          (() => {
            const orders = [
              foodItems[2], // Paneer Tikka
              foodItems[5], // Caesar Salad
            ].map(f => ({ item: f.name, price: f.price }));

            const { total, gstAmount, finalBill } = calculateBill(orders);

            return {
              customer_name: "Arjun Malhotra",
              orders,
              total_bill: total,
              gst_percentage: GST_RATE,
              gst_amount: gstAmount,
              final_bill: finalBill,
            };
          })(),
        ],
      },
      {
        table_id: 4,
        customers: [
          (() => {
            const orders = [
              foodItems[4], // Grilled Fish
              foodItems[9], // Chocolate Cake
            ].map(f => ({ item: f.name, price: f.price }));

            const { total, gstAmount, finalBill } = calculateBill(orders);

            return {
              customer_name: "Amit Verma",
              orders,
              total_bill: total,
              gst_percentage: GST_RATE,
              gst_amount: gstAmount,
              final_bill: finalBill,
            };
          })(),
        ],
      },
      {
        table_id: 5,
        customers: [
          (() => {
            const orders = [
              foodItems[6], // Mutton Curry
              foodItems[8], // Chicken Wings
            ].map(f => ({ item: f.name, price: f.price }));

            const { total, gstAmount, finalBill } = calculateBill(orders);

            return {
              customer_name: "Neha Rani",
              orders,
              total_bill: total,
              gst_percentage: GST_RATE,
              gst_amount: gstAmount,
              final_bill: finalBill,
            };
          })(),
        ],
      },
    ],
  },
};

export default hotelData;
