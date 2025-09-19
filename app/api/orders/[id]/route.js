import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(req, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db("Hotel");
    const body = await req.json();

    const order = await db.collection("orders").findOne({
      _id: new ObjectId(params.id),
    });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    let updatedItems = [...(order.items || [])];

    // ✅ Merge, update, or remove items
    if (body.items && Array.isArray(body.items) && body.items.length > 0) {
      for (const newItem of body.items) {
        const existing = updatedItems.find((i) => i.foodId === newItem.foodId);

        if (existing) {
          existing.quantity =
            (existing.quantity || 0) + (newItem.quantity || 0);

          // remove item if qty ≤ 0
          if (existing.quantity <= 0) {
            updatedItems = updatedItems.filter(
              (i) => i.foodId !== newItem.foodId
            );
          }
        } else if (newItem.quantity > 0) {
          updatedItems.push({ ...newItem, quantity: newItem.quantity });
        }
      }
    }

    // ✅ Prepare update object
    const updateDoc = {};
    if (body.status) updateDoc.status = body.status;
    if (body.items && body.items.length > 0) updateDoc.items = updatedItems;

    // If not paid, just update in orders
    if (body.status !== "paid") {
      if (Object.keys(updateDoc).length > 0) {
        await db.collection("orders").updateOne(
          { _id: new ObjectId(params.id) },
          { $set: updateDoc }
        );
      }
      return Response.json({ message: "Order updated successfully" });
    }

    // ✅ If paid → Move to bills collection
    const billDoc = {
      ...order,
      ...updateDoc,
      paidAt: new Date(),
    };

    await db.collection("bills").insertOne(billDoc);

    // ✅ Delete from orders
    await db.collection("orders").deleteOne({ _id: new ObjectId(params.id) });

    // ✅ Free table
    await db.collection("hoteladmin").updateOne(
      { "tables.tableNumber": Number(order.tableNumber) },
      { $set: { "tables.$.status": "available" } }
    );

    return Response.json({ message: "Order moved to bills successfully" });
  } catch (err) {
    console.error("🚨 Error updating order:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
