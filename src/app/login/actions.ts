
'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

// This is the server action that the login form will call.
export async function loginAction(prevState: string | undefined, formData: FormData) {
    try {
        // The `signIn` function from NextAuth.js handles the authentication logic.
        // We pass the provider ('credentials') and the form data.
        await signIn('credentials', formData);
    } catch (error) {
        // If an error occurs, we check its type.
        if (error instanceof AuthError) {
            switch (error.type) {
                // This error is thrown when the `authorize` callback in auth.ts returns null.
                case 'CredentialsSignin':
                    return 'Invalid email or password.';
                // This error can be thrown from our custom logic inside the authorize callback
                case 'CallbackRouteError':
                    return error.cause?.err?.message;
                default:
                    return 'An unexpected error occurred. Please try again.';
            }
        }
        // For any other errors, we re-throw them so Next.js can handle them.
        throw error;
    }
}
