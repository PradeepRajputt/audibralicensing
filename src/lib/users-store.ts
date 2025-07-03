
'use server';
import type { User, IUser } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import UserModel from '@/models/User';
import { connectToDatabase } from './db';
import { hashPassword } from './password';

const sanitizeUser = (userDoc: Document | null): User | null => {
  if (!userDoc) return null;
  // .toObject() with virtuals will convert _id to id
  const userObject = userDoc.toObject({ virtuals: true });
  // Mongoose's toObject doesn't remove the original _id by default
  delete userObject._id;
  delete userObject.__v;
  // The password field is already excluded from queries by default in the model schema
  return userObject as User;
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

export async function getUserByEmail(email: string, includePassword = false): Promise<IUser | null> {
    noStore();
    if (!email) return null;
    await connectToDatabase();
    const query = UserModel.findOne({ email });
    if(includePassword) {
      query.select('+password');
    }
    // IMPORTANT: This returns the Mongoose document
    return await query.exec();
}

export async function createUser(data: Omit<User, 'id' | 'joinDate' | 'status' | 'platformsConnected'> & { passwordPlain: string }) {
    noStore();
    await connectToDatabase();

    const hashedPassword = await hashPassword(data.passwordPlain);

    const newUser = new UserModel({
        displayName: data.displayName,
        email: data.email,
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
