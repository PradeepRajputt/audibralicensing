
'use server';
import connectToDatabase from '@/lib/mongodb';
import UserModel from '@/models/User';
import type { User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import bcrypt from 'bcryptjs';

// Helper to convert Mongoose doc to a plain User object and remove password
const toPlainUser = (userDoc: any): Omit<User, 'password'> | null => {
  if (!userDoc) return null;
  const userObject = userDoc.toObject();
  const { password, ...safeUser } = userObject;
  return safeUser;
};

export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  noStore();
  await connectToDatabase();
  const users = await UserModel.find({}).sort({ joinDate: -1 });
  return users.map(userDoc => toPlainUser(userDoc)!);
}

export async function getUserById(id: string): Promise<User | null> {
  noStore();
  if (!id) return null;
  await connectToDatabase();
  const user = await UserModel.findById(id);
  // Returns with password field undefined by default
  return user ? user.toObject() : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    noStore();
    if (!email) return null;
    await connectToDatabase();
    // We explicitly select the password field as it's needed for login verification
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select('+password');
    return user ? user.toObject() : null;
}

export async function createUser(data: Pick<User, 'email' | 'displayName' | 'password'> & { role?: User['role'] }): Promise<Omit<User, 'password'>> {
    noStore();
    await connectToDatabase();

    const existingUser = await UserModel.findOne({ email: data.email?.toLowerCase() });
    if (existingUser) {
        throw new Error("User with this email already exists.");
    }
    
    const hashedPassword = await bcrypt.hash(data.password!, 10);

    const newUserDoc = new UserModel({
        email: data.email,
        displayName: data.displayName,
        password: hashedPassword,
        role: data.role || 'creator',
        avatar: `https://placehold.co/128x128.png?text=${data.displayName?.charAt(0)}`
    });

    await newUserDoc.save();
    return toPlainUser(newUserDoc)!;
}

export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'password'>>): Promise<void> {
    noStore();
    await connectToDatabase();
    await UserModel.findByIdAndUpdate(id, updates);
    console.log(`Updated user ${id}.`);
}

export async function updateUserStatus(id: string, status: User['status']): Promise<void> {
    noStore();
    await updateUser(id, { status });
}
