import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("Hotel");

  // Fetch first (and only) admin document
  const data = await db.collection("hoteladmin").findOne({});
  return Response.json(data || {});
}

export async function POST(req) {
  const client = await clientPromise;
  const db = client.db("Hotel");
  const body = await req.json();

  const {
    totalTables,
    name,
    price,
    category,
    veg,
    active,
    updateId,
    deleteId,
  } = body;

  // ✅ Update total tables
  if (totalTables) {
    const admin = await db.collection("hoteladmin").findOne({});
    let tables = admin?.tables || [];

    if (tables.length === 0) {
      tables = Array.from({ length: Number(totalTables) }, (_, i) => ({
        tableNumber: i + 1,
        status: "available",
      }));
    } else {
      if (totalTables > tables.length) {
        for (let i = tables.length; i < totalTables; i++) {
          tables.push({ tableNumber: i + 1, status: "available" });
        }
      } else if (totalTables < tables.length) {
        tables = tables.slice(0, totalTables);
      }
    }

    await db.collection("hoteladmin").updateOne(
      {},
      {
        $set: {
          totalTables: Number(totalTables),
          tables,
        },
      },
      { upsert: true }
    );

    return Response.json({ status: "tables updated" });
  }

  // ✅ Delete menu item
  if (deleteId) {
    await db
      .collection("hoteladmin")
      .updateOne({}, { $pull: { menu: { foodId: deleteId } } });
    return Response.json({ status: "menu item deleted" });
  }

  // ✅ Update existing menu item
  if (updateId) {
    const updated = await db.collection("hoteladmin").updateOne(
      { "menu.foodId": updateId },
      {
        $set: {
          "menu.$.name": name,
          "menu.$.price": Number(price),
          "menu.$.veg": typeof veg === "boolean" ? veg : veg === "veg",
          "menu.$.category": category,
          "menu.$.active": active,
        },
      }
    );

    return Response.json({ success: true, updated });
  }

  // ✅ Add new menu item
  if (name && price && category) {
    const admin = await db.collection("hoteladmin").findOne({});
    let menu = admin?.menu || [];

    const maxId = menu.length
      ? Math.max(...menu.map((m) => m.foodId || 999))
      : 999;
    const nextId = maxId + 1;

    if (nextId > 1100) {
      return Response.json(
        { error: "Food ID limit reached (max 1100)" },
        { status: 400 }
      );
    }

    const normalizeVeg = (value) => {
      if (typeof value === "boolean") return value;
      if (typeof value === "string") {
        return value.toLowerCase() === "veg";
      }
      return false;
    };

    const newItem = {
      foodId: nextId,
      name,
      price: Number(price),
      veg: normalizeVeg(veg),
      category,
      active,
    };

    await db
      .collection("hoteladmin")
      .updateOne({}, { $push: { menu: newItem } }, { upsert: true });

    return Response.json({ status: "menu item added" });
  }

  return Response.json({ error: "Invalid request" }, { status: 400 });
}
