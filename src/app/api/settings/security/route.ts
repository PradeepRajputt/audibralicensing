import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator.js';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { email, phone, twoFactorEnabled } = body;
    if (!email) return Response.json({ error: 'Missing email' }, { status: 400 });
    await connectToDatabase();
    const update: any = {};
    if (phone !== undefined) update.phone = phone;
    if (twoFactorEnabled !== undefined) update.twoFactorEnabled = twoFactorEnabled;
    const result = await Creator.updateOne({ email }, { $set: update });
    if (result.modifiedCount === 0) {
      return Response.json({ error: 'User not found or nothing to update' }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (err) {
    console.error('Error updating security settings:', err);
    return Response.json({ error: 'Failed to update security settings' }, { status: 500 });
  }
} 