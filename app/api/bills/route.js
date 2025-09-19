import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Hotel");

    // ✅ Fetch bills sorted by newest first
    const bills = await db
      .collection("bills")
      .find({})
      .sort({ paidAt: -1 })
      .toArray();

    return Response.json(bills, { status: 200 });
  } catch (err) {
    console.error("🚨 Error fetching bills:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
