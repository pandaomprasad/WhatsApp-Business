import clientPromise from "@/lib/mongodb";
import { startOfDay, endOfDay, subDays, subWeeks, subMonths } from "date-fns";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("Hotel");

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "today";

    const today = new Date();
    let start, end;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (from && to) {
      start = new Date(from);
      end = new Date(to);
    }

    switch (type) {
      case "today":
        start = startOfDay(today);
        end = endOfDay(today);
        break;
      case "yesterday":
        start = startOfDay(subDays(today, 1));
        end = endOfDay(subDays(today, 1));
        break;
      case "week":
        start = startOfDay(subWeeks(today, 1));
        end = endOfDay(today);
        break;
      case "month":
        start = startOfDay(subMonths(today, 1));
        end = endOfDay(today);
        break;
      default:
        start = startOfDay(today);
        end = endOfDay(today);
    }

    // --- Total Revenue ---
    const revenue = await db
      .collection("bills")
      .aggregate([
        { $match: { createdAt: { $gte: start, $lte: end }, status: "paid" } },
        { $group: { _id: null, totalRevenue: { $sum: "$grandTotal" } } },
      ])
      .toArray();

    // --- Most Sold Food ---
    // --- Most Sold Food ---
    const mostSoldAgg = await db
      .collection("bills")
      .aggregate([
        { $match: { status: "paid" } }, // use orders collection
        { $unwind: "$items" },
        {
          $addFields: {
            "items.qty": { $toInt: "$items.quantity" }, // ensure numeric
          },
        },
        {
          $group: {
            _id: "$items.name",
            totalQty: { $sum: "$items.qty" },
          },
        },
        { $sort: { totalQty: -1 } },
        { $limit: 1 }, // change to 5 if you want top 5
      ])
      .toArray();

    console.log(mostSoldAgg);

    // --- Visitors (order count) ---
    const visitors = await db.collection("bills").countDocuments({
      createdAt: { $gte: start, $lte: end },
      status: "paid",
    });

    // --- Daily Revenue ---
    const dailyRevenue = await db
      .collection("bills")
      .aggregate([
        { $match: { createdAt: { $gte: start, $lte: end }, status: "paid" } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$grandTotal" },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    // --- Hourly Revenue (only for today) ---
    let hourlyRevenue = [];
    if (type === "today") {
      hourlyRevenue = await db
        .collection("bills")
        .aggregate([
          { $match: { createdAt: { $gte: start, $lte: end }, status: "paid" } },
          {
            $group: {
              _id: { $dateToString: { format: "%H", date: "$createdAt" } },
              revenue: { $sum: "$grandTotal" },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray();

      hourlyRevenue = hourlyRevenue.map((r) => ({
        hour: parseInt(r._id, 10),
        revenue: r.revenue,
      }));
    }

    // --- Response ---
    return new Response(
      JSON.stringify({
        revenue: revenue[0]?.totalRevenue || 0,
        mostSold: mostSoldAgg[0]?._id || null,
        totalPeople: visitors,
        dailyRevenue: dailyRevenue.map((r) => ({
          date: r._id,
          revenue: r.revenue,
        })),
        hourlyRevenue, // only non-empty if type="today"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("🚨 Analytics API error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
