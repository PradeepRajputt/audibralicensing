
'use client';

import { useState, useEffect } from 'react';

// A small component to safely render dates on the client to avoid hydration mismatch
export const ClientFormattedDate = ({ dateString, options }: { dateString: string, options?: Intl.DateTimeFormatOptions }) => {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);

    useEffect(() => {
        // This will only run on the client, after the initial render.
        if (dateString) {
            setFormattedDate(new Date(dateString).toLocaleDateString(undefined, options));
        }
    }, [dateString, options]);
    
    // Render a placeholder or nothing on the server to prevent mismatch
    if (!formattedDate) {
        // You can return a skeleton loader here if you prefer
        return null;
    }
    
    return <>{formattedDate}</>;
};
