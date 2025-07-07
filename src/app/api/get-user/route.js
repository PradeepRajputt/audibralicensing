import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  await connectDB();
  const user = await User.findOne({ email });
  return Response.json(user || {});
}
