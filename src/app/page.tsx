
import { HeroAnimation } from '@/components/landing/hero-animation';
import { Overlay } from '@/components/landing/overlay';

export default function HomePage() {
  return (
    <div className="relative h-svh w-full overflow-hidden bg-background">
      <HeroAnimation />
      <Overlay />
    </div>
  );
}
