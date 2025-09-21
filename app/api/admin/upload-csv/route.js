import clientPromise from "@/lib/mongodb"; // your MongoDB connection helper

export async function POST(req) {
  try {
    const body = await req.json();
    const items = body.items;

    if (!items || !Array.isArray(items) || !items.length) {
      return new Response(
        JSON.stringify({ error: "No items provided" }),
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Hotel"); // replace with your DB name

    // Add a unique foodId for each item
    const menuWithIds = items.map((item, index) => ({
      ...item,
      foodId: Date.now() + index, // simple unique ID, you can use uuid if preferred
    }));

    const result = await db.collection("hoteladmin").updateOne(
      {}, // update your admin document (or you can filter by adminId if multi-admin)
      {
        $push: {
          menu: { $each: menuWithIds },
        },
      },
      { upsert: true }
    );

    return new Response(
      JSON.stringify({ message: "CSV uploaded successfully", result }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Upload CSV error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500 }
    );
  }
}
