
'use server';
import type { User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import connectToDatabase from './mongodb';
import UserModel from '@/models/User';

// Helper to convert a Mongoose document from .lean() to our User type.
// .lean() returns a plain JS object, not a Mongoose document.
function mongoDocToUser(doc: any): User | null {
    if (!doc) return null;
    const user = { ...doc };
    user.id = user._id.toString();
    delete user._id;
    delete user.__v;
    return user as User;
}

export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  noStore();
  await connectToDatabase();
  // .lean() returns plain JS objects, which is faster and safer.
  const users = await UserModel.find({ role: 'creator' }).lean();
  // We still map to ensure the ID is transformed correctly.
  return users.map(user => mongoDocToUser(user)!).filter(Boolean) as Omit<User, 'password'>[];
}

export async function getUserById(id: string): Promise<User | undefined> {
  noStore();
  await connectToDatabase();
  try {
    const user = await UserModel.findById(id).lean();
    return mongoDocToUser(user) ?? undefined;
  } catch (error) {
    // Mongoose can throw an error if the ID format is invalid.
    console.error("Error finding user by ID (likely invalid ID format):", id, error);
    return undefined;
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
    noStore();
    await connectToDatabase();
    const user = await UserModel.findOne({ email }).lean();
    return mongoDocToUser(user);
}

export async function findUserByEmailWithAuth(email: string): Promise<User | null> {
    noStore();
    await connectToDatabase();
    const user = await UserModel.findOne({ email }).select('+emailOtpHash +otpExpires +backupPinHash').lean();
    return mongoDocToUser(user);
}

export async function findOrCreateUserByEmail(email: string): Promise<User> {
    noStore();
    await connectToDatabase();
    const existingUser = await UserModel.findOne({ email }).lean();

    if (existingUser) {
        return mongoDocToUser(existingUser)!;
    }

    const newUser = new UserModel({
        email,
        displayName: email.split('@')[0], // Default display name
        avatar: `https://placehold.co/128x128.png`,
    });
    await newUser.save();
    return mongoDocToUser(newUser.toObject())!;
}

export async function updateUser(id: string, updates: Partial<Omit<User, 'id'>>): Promise<void> {
    noStore();
    await connectToDatabase();
    await UserModel.findByIdAndUpdate(id, updates);
}

export async function updateUserStatus(id: string, status: User['status']): Promise<void> {
    await updateUser(id, { status });
}

export async function setUserOtp(email: string, hashedOtp: string, expires: Date): Promise<void> {
  await connectToDatabase();
  await UserModel.updateOne({ email }, {
    $set: {
      emailOtpHash: hashedOtp,
      otpExpires: expires
    }
  });
}

export async function setBackupPin(userId: string, hashedPin: string): Promise<void> {
    await connectToDatabase();
    await UserModel.findByIdAndUpdate(userId, {
        $set: { backupPinHash: hashedPin }
    });
}
