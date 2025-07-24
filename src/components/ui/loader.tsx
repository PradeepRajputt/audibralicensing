import React from 'react';

const defaultMessages = [
  'Aapka data load ho raha hai...',
  'Bas thoda sa intezaar...',
  'Almost done, last moment...',
  'Data aa raha hai, please wait...'
];

export function InteractiveLoader({ messages = defaultMessages, show = true }: { messages?: string[], show?: boolean }) {
  const [msgIdx, setMsgIdx] = React.useState(0);

  React.useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setMsgIdx((idx) => (idx + 1) % messages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [show, messages.length]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="mb-6">
        <div className="loader-spinner" />
      </div>
      <div className="text-lg font-semibold text-primary animate-pulse text-center px-4">
        {messages[msgIdx]}
      </div>
      <style jsx>{`
        .loader-spinner {
          border: 6px solid #e5e7eb;
          border-top: 6px solid #6366f1;
          border-radius: 50%;
          width: 56px;
          height: 56px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 