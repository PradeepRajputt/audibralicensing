
'use server';
import type { User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import connectToDatabase from './mongodb';
import UserModel from '@/models/User';

export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  noStore();
  await connectToDatabase();
  const users = await UserModel.find({ role: 'creator' }).select('-password');
  return JSON.parse(JSON.stringify(users)); // Serialize to plain objects
}

export async function getUserById(id: string): Promise<User | undefined> {
  noStore();
  await connectToDatabase();
  const user = await UserModel.findById(id).select('-password');
  return user ? JSON.parse(JSON.stringify(user)) : undefined;
}

export async function findUserByEmail(email: string): Promise<User | null> {
    noStore();
    await connectToDatabase();
    const user = await UserModel.findOne({ email });
    return user ? JSON.parse(JSON.stringify(user, (key, value) => key === '_id' ? value.toString() : value)) : null;
}

export async function findUserByEmailWithPassword(email: string): Promise<User | null> {
    noStore();
    await connectToDatabase();
    const user = await UserModel.findOne({ email }).select('+password');
    return user ? JSON.parse(JSON.stringify(user, (key, value) => key === '_id' ? value.toString() : value)) : null;
}


export async function createUser(data: Omit<User, 'id'>): Promise<User> {
    noStore();
    await connectToDatabase();
    const newUser = new UserModel(data);
    await newUser.save();
    return JSON.parse(JSON.stringify(newUser));
}

export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'password'>>): Promise<void> {
    noStore();
    await connectToDatabase();
    await UserModel.findByIdAndUpdate(id, updates);
}

export async function updateUserStatus(id: string, status: User['status']): Promise<void> {
    await updateUser(id, { status });
}
