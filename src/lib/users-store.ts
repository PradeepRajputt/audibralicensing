
'use server';
import mongoose from 'mongoose';
import CreatorModel from '@/models/Creator';
import type { User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  noStore();
  await mongoose.connect(process.env.MONGODB_URI!);
  const users = await CreatorModel.find({}).lean();
  return users;
}

export async function getUserById(id: string): Promise<User | undefined> {
  noStore();
  await mongoose.connect(process.env.MONGODB_URI!);
  const user = await CreatorModel.findOne({ _id: id }).lean();
  return user || undefined;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  noStore();
  await mongoose.connect(process.env.MONGODB_URI!);
  const user = await CreatorModel.findOne({ email }).lean();
  if (!user) return undefined;
  // Ensure id field is present for compatibility
  return { ...user, id: user._id?.toString() };
}

export async function createUser(data: Omit<User, 'joinDate' | 'status'> & { image?: string | null }): Promise<User> {
  noStore();
  await mongoose.connect(process.env.MONGODB_URI!);
  let user = await CreatorModel.findOne({ email: data.email });
  if (user) {
    return user.toObject();
  }
  user = await CreatorModel.create({
    ...data,
    joinDate: new Date().toISOString(),
    status: 'active',
    avatar: data.image ?? 'https://placehold.co/128x128.png',
  });
  return user.toObject();
}

export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'uid' | 'email'>>): Promise<void> {
  noStore();
  await mongoose.connect(process.env.MONGODB_URI!);
  await CreatorModel.updateOne({ _id: id }, { $set: updates });
}

export async function updateUserStatus(id: string, status: User['status']): Promise<void> {
  noStore();
  await mongoose.connect(process.env.MONGODB_URI!);
  await CreatorModel.updateOne({ _id: id }, { $set: { status } });
}
