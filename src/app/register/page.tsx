'use client';

import { redirect } from "next/navigation";
import { useEffect } from "react";

// This page is a redirect to the new registration page.
export default function OldSignupPage() {
    useEffect(() => {
        redirect('/login');
    }, []);
    return null;
}
