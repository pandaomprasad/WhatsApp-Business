import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Hotel");

    // Check if any owner already exists
    const existingOwner = await db.collection("users").findOne({ role: "owner" });
    if (existingOwner) {
      return new Response(
        JSON.stringify({ message: "Owner already exists" }),
        { status: 400 }
      );
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash("owner123", 10); // default password

    // Insert first owner
    const owner = {
      name: "Main Owner",
      email: "owner@example.com",
      password: hashedPassword,
      role: "owner",
      createdAt: new Date(),
    };

    await db.collection("users").insertOne(owner);

    return new Response(
      JSON.stringify({
        message: "Owner created successfully",
        email: owner.email,
        password: "owner123",
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error("🚨 Setup owner error:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
