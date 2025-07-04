
'use server';

import { z } from "zod";
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { findOrCreateUserByEmail, setUserOtp, findUserByEmailWithAuth } from '@/lib/users-store';
import { sendLoginOtpEmail } from '@/lib/services/backend-services';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const OtpRequestSchema = z.string().email({ message: "Invalid email address." });

export async function requestLoginOtpAction(email: string) {
    const validation = OtpRequestSchema.safeParse(email);
    if (!validation.success) {
        return { success: false, message: validation.error.flatten().formErrors.join(', '), otp: null };
    }

    try {
        await findOrCreateUserByEmail(email);

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const hashedOtp = await bcrypt.hash(otp, 10);
        
        await setUserOtp(email, hashedOtp, expires);
        
        const emailResult = await sendLoginOtpEmail({ to: email, otp });
        
        if (!emailResult.success) {
            console.error("Email sending simulation failed:", emailResult.message);
            // Even if "sending" fails, we can proceed in a dev environment
            if(emailResult.otp) {
               return { success: true, message: "OTP simulated.", otp: emailResult.otp };
            }
            return { success: false, message: "Could not generate OTP. Please try again later.", otp: null };
        }
        
        // Return the OTP in the success response for the client to display.
        return { success: true, message: "OTP sent (simulated).", otp: emailResult.otp };
    } catch (error) {
        console.error("OTP Request Error:", error);
        return { success: false, message: "An unexpected error occurred. Please try again later.", otp: null };
    }
}


const VerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().optional(),
  pin: z.string().optional(),
});

export async function verifyLoginAction(values: z.infer<typeof VerifySchema>) {
    const validation = VerifySchema.safeParse(values);
    if (!validation.success) {
        return { success: false, message: "Invalid input." };
    }

    const { email, otp, pin } = validation.data;

    try {
        const user = await findUserByEmailWithAuth(email);

        if (!user) {
            return { success: false, message: "User not found." };
        }

        let isVerified = false;

        if (otp) {
            if (!user.emailOtpHash || !user.otpExpires) {
                return { success: false, message: "No OTP was requested for this user." };
            }
            if (new Date() > user.otpExpires) {
                return { success: false, message: "Your OTP has expired. Please request a new one." };
            }
            isVerified = await bcrypt.compare(otp, user.emailOtpHash);
            if(!isVerified) {
                return { success: false, message: "Invalid OTP provided." };
            }
        } else if (pin) {
             if (!user.backupPinHash) {
                return { success: false, message: "You have not set up a backup PIN." };
            }
            isVerified = await bcrypt.compare(pin, user.backupPinHash);
            if (!isVerified) {
                return { success: false, message: "Invalid PIN provided." };
            }
        } else {
             return { success: false, message: "No verification method provided." };
        }

        if (isVerified) {
            // Clear OTP after successful login
            await setUserOtp(email, '', new Date(0));

            const token = await new SignJWT({
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                role: user.role,
                avatar: user.avatar,
            })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1d')
            .sign(JWT_SECRET);

            cookies().set('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24, // 1 day
            });

            return { success: true, role: user.role, message: "Login successful!" };
        }
        
        return { success: false, message: "Verification failed." };

    } catch (error) {
        console.error('Verification error:', error);
        return { success: false, message: 'An internal server error occurred.' };
    }
}
