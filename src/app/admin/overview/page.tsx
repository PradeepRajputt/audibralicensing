
'use client';

import React from "react";
import { Users, UserPlus, ScanSearch } from 'lucide-react';

function CountUp({ end, duration = 1.2, className = '' }: { end: number, duration?: number, className?: string }) {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    let startTime: number | null = null;
    function animate(ts: number) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / (duration * 1000), 1);
      setValue(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
      else setValue(end);
    }
    requestAnimationFrame(animate);
  }, [end, duration]);
  return <span className={className}>{value}</span>;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setStats(null);
        } else {
          setStats(data);
          setError(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load data");
        setStats(null);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-lg">Loading admin stats...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!stats) return <div className="p-8 text-center text-red-500">No data available</div>;

  const cards = [
    {
      label: "Total Creators",
      value: stats.totalCreators,
      icon: <Users className="h-8 w-8 text-blue-400" />,
    },
    {
      label: "New Signups (in 24h)",
      value: stats.newSignups,
      icon: <UserPlus className="h-8 w-8 text-green-400" />,
    },
    {
      label: "Total Scans",
      value: stats.totalScans,
      icon: <ScanSearch className="h-8 w-8 text-purple-400" />,
    }
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold mb-2 text-white">Admin Overview</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className={
              `rounded-xl shadow-md p-6 flex flex-col items-start transition-transform duration-200 animate-fade-in-up cursor-pointer border-4 border-lightgrey`
            }
            style={{ minHeight: 150 }}
          >
            <div className="mb-4">{card.icon}</div>
            <div className="text-4xl font-extrabold text-white mb-3">
              <CountUp end={card.value} />
            </div>
            <div className="text-lg text-muted-foreground font-medium">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
