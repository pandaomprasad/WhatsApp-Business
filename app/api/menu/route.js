import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("Hotel");
  const admin = await db.collection("hoteladmin").findOne({});
  return Response.json(admin?.menu || []);
}
