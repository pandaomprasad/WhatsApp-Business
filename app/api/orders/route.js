import clientPromise from "@/lib/mongodb";

// ================== CREATE ORDER ==================
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("Hotel");
    const body = await req.json();

    const {
      tableNumber,
      items,
      customerName,
      customerPhone,
      subtotal,
      gst,
      grandTotal,
    } = body;

    // ✅ Server-side validation
    if (!customerName || customerName.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Customer name is required" }),
        { status: 400 }
      );
    }

    if (!/^\+91\d{10}$/.test(customerPhone)) {
      return new Response(
        JSON.stringify({
          error: "Invalid phone number. Must be +91 followed by 10 digits.",
        }),
        { status: 400 }
      );
    }

    if (!tableNumber || !items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Table number and items are required" }),
        {
          status: 400,
        }
      );
    }
    if (
      typeof subtotal !== "number" ||
      typeof gst !== "number" ||
      typeof grandTotal !== "number"
    ) {
      return new Response(
        JSON.stringify({ error: "Billing values are missing or invalid" }),
        { status: 400 }
      );
    }

    // ✅ Generate bill number (auto-increment with leading zeros)
    const lastOrder = await db
      .collection("orders")
      .find()
      .sort({ billNo: -1 })
      .limit(1)
      .toArray();

    const nextBillNo =
      lastOrder.length > 0 ? Number(lastOrder[0].billNo) + 1 : 1;

    // Always store as a number
    const newOrder = {
      tableNumber,
      items,
      customerName: customerName.trim(),
      customerPhone,
      status: "pending",
      billNo: nextBillNo, // ✅ FIXED
      createdAt: new Date(),
      subtotal,
      gst,
      grandTotal,
    };

    await db.collection("orders").insertOne(newOrder);

    // ✅ Mark table as occupied
    await db
      .collection("hoteladmin")
      .updateOne(
        { "tables.tableNumber": Number(tableNumber) },
        { $set: { "tables.$.status": "occupied" } }
      );

    return new Response(
      JSON.stringify({
        message: "Order placed successfully",
        billNo: nextBillNo,
      }), // ✅ FIXED
      { status: 201 }
    );
  } catch (err) {
    console.error("🚨 Error creating order:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

// ================== FETCH ALL ORDERS ==================
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Hotel");

    const orders = await db
      .collection("orders")
      .find({ status: { $ne: "paid" } })
      .sort({ createdAt: -1 })
      .toArray();

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("🚨 Error fetching orders:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch orders" }), {
      status: 500,
    });
  }
}

// ================== UPDATE ORDER STATUS ==================
export async function PATCH(req) {
  try {
    const client = await clientPromise;
    const db = client.db("Hotel");

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return new Response(
        JSON.stringify({ error: "Order ID and status are required" }),
        {
          status: 400,
        }
      );
    }

    const { ObjectId } = require("mongodb");

    await db
      .collection("orders")
      .updateOne({ _id: new ObjectId(id) }, { $set: { status } });

    // ✅ Free up table if paid
    if (status === "paid") {
      const order = await db
        .collection("orders")
        .findOne({ _id: new ObjectId(id) });
      if (order?.tableNumber) {
        await db
          .collection("hoteladmin")
          .updateOne(
            { "tables.tableNumber": order.tableNumber },
            { $set: { "tables.$.status": "available" } }
          );
      }
    }

    return new Response(
      JSON.stringify({ message: "Order updated successfully" }),
      { status: 200 }
    );
  } catch (err) {
    console.error("🚨 Error updating order:", err);
    return new Response(JSON.stringify({ error: "Failed to update order" }), {
      status: 500,
    });
  }
}
