import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Hotel");
    const collection = db.collection("bills");

    const changeStream = collection.watch([], { fullDocument: "updateLookup" });
    const encoder = new TextEncoder();

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const change of changeStream) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(change.fullDocument)}\n\n`)
              );
            }
          } catch (err) {
            console.error("🚨 Error inside stream:", err);
          }
        },
        cancel() {
          console.log("❌ SSE connection closed by client");
          changeStream.close();
        },
      }),
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      }
    );
  } catch (err) {
    console.error("🚨 Error opening change stream:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
