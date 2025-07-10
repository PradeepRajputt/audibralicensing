import { connectDB } from "@/lib/mongodb";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  await connectDB();
  // Remove: const user = await User.findOne({ email });
  // Use Creator or Admin as needed, or return error if not needed.
  return Response.json({}); // Placeholder for user data
}
