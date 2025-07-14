import { NextResponse } from 'next/server';
import { getAdminProfile } from '@/lib/admin-stats';
import Admin from '@/models/Admin';
import connectToDatabase from '@/lib/mongodb';

export async function GET() {
  try {
    const admin: any = await getAdminProfile();
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }
    let avatar = null;
    if (admin.avatar) {
      avatar = Buffer.isBuffer(admin.avatar)
        ? `data:image/png;base64,${admin.avatar.toString('base64')}`
        : admin.avatar;
    }
    return NextResponse.json({ email: admin.email || null, name: admin.name || null, avatar });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admin profile' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { avatar, email } = body;
    if (!avatar || !email) {
      return NextResponse.json({ error: 'Avatar image and email are required' }, { status: 400 });
    }
    const base64 = avatar.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');
    const admin = await Admin.findOneAndUpdate({ email }, { avatar: buffer }, { new: true });
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update avatar' }, { status: 500 });
  }
} 