
'use server';
import type { User, IUser } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import UserModel from '@/models/User';
import { connectToDatabase } from './db';
import bcrypt from 'bcryptjs';


const sanitizeUser = (userDoc: Document | null): User | null => {
  if (!userDoc) return null;
  const userObject = userDoc.toObject({ virtuals: true });
  delete userObject._id;
  delete userObject.__v;
  delete userObject.password; // Important: do not send password hash to client
  return userObject as User;
};

export async function getAllUsers(): Promise<User[]> {
  noStore();
  await connectToDatabase();
  const users = await UserModel.find({}).sort({ joinDate: -1 });
  return users.map(user => sanitizeUser(user)!);
}

export async function getUserById(id: string): Promise<User | null> {
  noStore();
  if (!id) return null;
  await connectToDatabase();
  const user = await UserModel.findById(id);
  return sanitizeUser(user);
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
    noStore();
    if (!email) return null;
    await connectToDatabase();
    return await UserModel.findOne({ email }).exec();
}

export async function getUserByDisplayName(displayName: string): Promise<IUser | null> {
    noStore();
    if (!displayName) return null;
    await connectToDatabase();
    return await UserModel.findOne({ displayName }).exec();
}

export async function createUser(data: Pick<User, 'email' | 'displayName' | 'password'> & { role?: User['role'] }) {
    noStore();
    await connectToDatabase();

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = new UserModel({
        email: data.email,
        displayName: data.displayName,
        password: hashedPassword,
        role: data.role || 'creator',
        joinDate: new Date().toISOString(),
        status: 'active',
        platformsConnected: [],
        avatar: `https://placehold.co/128x128.png?text=${data.displayName?.charAt(0)}`
    });

    await newUser.save();
    return sanitizeUser(newUser);
}

export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | '_id'>>): Promise<void> {
    noStore();
    await connectToDatabase();
    // Ensure password is not updated directly through this function
    if (updates.password) {
        delete updates.password;
    }
    const result = await UserModel.findByIdAndUpdate(id, updates);
     if (!result) {
        console.warn(`Attempted to update non-existent user with ID: ${id}`);
    }
    console.log(`Updated user ${id}.`);
}

export async function updateUserStatus(id: string, status: User['status']): Promise<void> {
    noStore();
    await connectToDatabase();
    await UserModel.findByIdAndUpdate(id, { $set: { status } });
}
