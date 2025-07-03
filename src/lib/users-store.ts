
'use server';
import type { User, IUser } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import UserModel from '@/models/User';
import { connectToDatabase } from './db';
import { hashPassword } from './password';

const sanitizeUser = (userDoc: IUser | null): User | null => {
  if (!userDoc) return null;
  const userObject = userDoc.toObject({ virtuals: true });
  delete userObject.password;
  delete userObject._id;
  delete userObject.__v;
  return {
      ...userObject,
      uid: userObject.id.toString(),
  };
};

export async function getAllUsers(): Promise<User[]> {
  noStore();
  await connectToDatabase();
  const users = await UserModel.find({ role: 'creator' }).sort({ joinDate: -1 });
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
    const user = await UserModel.findOne({ email });
    // IMPORTANT: This returns the Mongoose document with the password hash
    return user;
}

export async function createUser(data: { displayName: string; email: string; passwordHash: string; role: 'creator' | 'admin' }) {
    noStore();
    await connectToDatabase();

    const hashedPassword = await hashPassword(data.passwordHash);

    const newUser = new UserModel({
        displayName: data.displayName,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        joinDate: new Date().toISOString(),
        status: 'active',
        platformsConnected: [],
        avatar: `https://placehold.co/128x128.png?text=${data.displayName.charAt(0)}`
    });

    await newUser.save();
    return sanitizeUser(newUser);
}

export async function updateUser(uid: string, updates: Partial<Omit<User, 'uid' | '_id'>>): Promise<void> {
    noStore();
    await connectToDatabase();
    const result = await UserModel.findByIdAndUpdate(uid, updates);
     if (!result) {
        console.warn(`Attempted to update non-existent user with UID: ${uid}`);
    }
    console.log(`Updated user ${uid}.`);
}

export async function updateUserStatus(uid: string, status: User['status']): Promise<void> {
    noStore();
    await connectToDatabase();
    await UserModel.findByIdAndUpdate(uid, { $set: { status } });
}
