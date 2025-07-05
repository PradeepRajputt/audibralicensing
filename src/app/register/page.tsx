
'use client';

import { redirect } from "next/navigation";
import { useEffect } from "react";

// This page is a redirect to the new main page since auth was removed.
export default function DeprecatedRegisterPage() {
    useEffect(() => {
        redirect('/');
    }, []);
    return null;
}
