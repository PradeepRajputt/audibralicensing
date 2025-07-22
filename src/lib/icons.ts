// Centralized icon management for better tree-shaking and performance
import { lazy } from 'react';
import { LucideProps } from 'lucide-react';

// Dynamically import only the icons we need from lucide-react
export const Icons = {
  // Navigation & UI
  ArrowLeft: lazy(() => import('lucide-react').then(mod => ({ default: mod.ArrowLeft }))),
  ArrowRight: lazy(() => import('lucide-react').then(mod => ({ default: mod.ArrowRight }))),
  Check: lazy(() => import('lucide-react').then(mod => ({ default: mod.Check }))),
  X: lazy(() => import('lucide-react').then(mod => ({ default: mod.X }))),
  Menu: lazy(() => import('lucide-react').then(mod => ({ default: mod.Menu }))),
  MoreHorizontal: lazy(() => import('lucide-react').then(mod => ({ default: mod.MoreHorizontal }))),
  
  // Content & Media
  Eye: lazy(() => import('lucide-react').then(mod => ({ default: mod.Eye }))),
  FileText: lazy(() => import('lucide-react').then(mod => ({ default: mod.FileText }))),
  FileVideo: lazy(() => import('lucide-react').then(mod => ({ default: mod.FileVideo }))),
  Image: lazy(() => import('lucide-react').then(mod => ({ default: mod.Image }))),
  Music: lazy(() => import('lucide-react').then(mod => ({ default: mod.Music }))),
  
  // Actions
  Edit: lazy(() => import('lucide-react').then(mod => ({ default: mod.Edit }))),
  Trash2: lazy(() => import('lucide-react').then(mod => ({ default: mod.Trash2 }))),
  Download: lazy(() => import('lucide-react').then(mod => ({ default: mod.Download }))),
  Upload: lazy(() => import('lucide-react').then(mod => ({ default: mod.Upload }))),
  Send: lazy(() => import('lucide-react').then(mod => ({ default: mod.Send }))),
  
  // Status & Feedback
  Loader2: lazy(() => import('lucide-react').then(mod => ({ default: mod.Loader2 }))),
  AlertCircle: lazy(() => import('lucide-react').then(mod => ({ default: mod.AlertCircle }))),
  CheckCircle2: lazy(() => import('lucide-react').then(mod => ({ default: mod.CheckCircle2 }))),
  
  // Users & Account
  User: lazy(() => import('lucide-react').then(mod => ({ default: mod.User }))),
  Users: lazy(() => import('lucide-react').then(mod => ({ default: mod.Users }))),
  UserPlus: lazy(() => import('lucide-react').then(mod => ({ default: mod.UserPlus }))),
  
  // Settings & Config
  Settings: lazy(() => import('lucide-react').then(mod => ({ default: mod.Settings }))),
  SlidersHorizontal: lazy(() => import('lucide-react').then(mod => ({ default: mod.SlidersHorizontal }))),
  
  // External Services
  Youtube: lazy(() => import('lucide-react').then(mod => ({ default: mod.Youtube }))),
  Globe: lazy(() => import('lucide-react').then(mod => ({ default: mod.Globe }))),
  
  // Security & Protection
  Shield: lazy(() => import('lucide-react').then(mod => ({ default: mod.Shield }))),
  ShieldAlert: lazy(() => import('lucide-react').then(mod => ({ default: mod.ShieldAlert }))),
  ShieldCheck: lazy(() => import('lucide-react').then(mod => ({ default: mod.ShieldCheck }))),
  Lock: lazy(() => import('lucide-react').then(mod => ({ default: mod.Lock }))),
  
  // Analytics & Data
  Calendar: lazy(() => import('lucide-react').then(mod => ({ default: mod.Calendar }))),
  BarChart: lazy(() => import('lucide-react').then(mod => ({ default: mod.BarChart }))),
  TrendingUp: lazy(() => import('lucide-react').then(mod => ({ default: mod.TrendingUp }))),
};

// Type for icon props
export type IconProps = LucideProps;

// Helper component for consistent icon rendering with Suspense
import { Suspense } from 'react';

interface LazyIconProps extends LucideProps {
  icon: keyof typeof Icons;
  fallback?: React.ReactNode;
}

export const LazyIcon = ({ icon, fallback = <div className="w-4 h-4" />, ...props }: LazyIconProps) => {
  const IconComponent = Icons[icon];
  
  return (
    <Suspense fallback={fallback}>
      <IconComponent {...props} />
    </Suspense>
  );
};

// Commonly used react-icons (only import what we absolutely need)
export const ReactIcons = {
  // Only import specific icons we use frequently
  FaShieldAlt: lazy(() => import('react-icons/fa').then(mod => ({ default: mod.FaShieldAlt }))),
  FaCrown: lazy(() => import('react-icons/fa').then(mod => ({ default: mod.FaCrown }))),
  FaGem: lazy(() => import('react-icons/fa').then(mod => ({ default: mod.FaGem }))),
  FaRocket: lazy(() => import('react-icons/fa').then(mod => ({ default: mod.FaRocket }))),
  FaStar: lazy(() => import('react-icons/fa').then(mod => ({ default: mod.FaStar }))),
  FaUser: lazy(() => import('react-icons/fa').then(mod => ({ default: mod.FaUser }))),
  FaUserShield: lazy(() => import('react-icons/fa').then(mod => ({ default: mod.FaUserShield }))),
};

export const LazyReactIcon = ({ icon, fallback = <div className="w-4 h-4" />, ...props }: {
  icon: keyof typeof ReactIcons;
  fallback?: React.ReactNode;
  [key: string]: any;
}) => {
  const IconComponent = ReactIcons[icon];
  
  return (
    <Suspense fallback={fallback}>
      <IconComponent {...props} />
    </Suspense>
  );
};