
import { Overlay } from '@/components/landing/overlay';
import { ClientHero } from '@/components/landing/client-hero';

export default function HomePage() {
  return (
    <div className="relative h-svh w-full overflow-hidden bg-background">
      <ClientHero />
      <Overlay />
    </div>
  );
}
