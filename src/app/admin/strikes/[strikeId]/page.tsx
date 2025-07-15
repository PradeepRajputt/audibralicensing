
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import StrikeDetailsClientPage from './details-client-page';
import { getStrikeById } from '@/lib/reports-store';
import type { Report } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function StrikeDetailsPage() {
  const params = useParams();
  const strikeId = params.strikeId as string;

  const [strike, setStrike] = useState<Report | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (strikeId) {
      getStrikeById(strikeId).then(data => {
        setStrike(data);
        setIsLoading(false);
      });
    } else {
        setIsLoading(false);
    }
  }, [strikeId]);
  
  if(isLoading) {
    return <div className="flex items-center justify-center h-full py-10"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
  }

  return <StrikeDetailsClientPage initialStrike={strike} />;
}
