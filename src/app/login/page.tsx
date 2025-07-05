
'use client';

// This file is no longer used and can be deleted. Authentication is now handled by next-auth.
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function DeprecatedLoginPage() {
    useEffect(() => {
        redirect('/');
    }, []);
    return null;
}
