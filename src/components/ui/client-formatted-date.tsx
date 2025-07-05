
'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';


interface ClientFormattedDateProps {
    dateString: string;
    options?: Intl.DateTimeFormatOptions;
    relative?: boolean;
}

// A small component to safely render dates on the client to avoid hydration mismatch
export const ClientFormattedDate = ({ dateString, options, relative = false }: ClientFormattedDateProps) => {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);

    useEffect(() => {
        // This will only run on the client, after the initial render.
        if (dateString) {
            const date = new Date(dateString);
            if(relative) {
                setFormattedDate(formatDistanceToNow(date, { addSuffix: true }));
            } else {
                 setFormattedDate(new Date(dateString).toLocaleDateString(undefined, options));
            }
        }
    }, [dateString, options, relative]);
    
    // Render a placeholder or nothing on the server to prevent mismatch
    if (!formattedDate) {
        // You can return a skeleton loader here if you prefer
        return null;
    }
    
    return <>{formattedDate}</>;
};
