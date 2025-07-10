import connectToDatabase from "@/lib/mongodb";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, name, channel, location } = body;

    if (!email)
      return Response.json({ error: "Missing email" }, { status: 400 });

    await connectToDatabase();

    // The User model is removed, so this part of the logic needs to be re-evaluated
    // or the function needs to be updated to use Creator or Admin models.
    // For now, we'll return an error as the User model is no longer imported.
    return Response.json({ error: "User model is no longer available" }, { status: 500 });

  } catch (err) {
    console.error("Error saving user:", err);
    return Response.json({ error: "Failed to save user" }, { status: 500 });
  }
}
