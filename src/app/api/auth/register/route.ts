import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import UserModel from '@/models/User';
import connectToDatabase from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { email, password, displayName } = await req.json();

    if (!email || !password || !displayName) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({
      email,
      password: hashedPassword,
      displayName,
      avatar: `https://placehold.co/128x128.png`,
    });

    console.log("user registered: ", user);
    await user.save();

    return NextResponse.json({ success: true, message: 'Registration successful!' }, { status: 201 });
  } catch (err: any) {
    console.error("Register Error:", err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
