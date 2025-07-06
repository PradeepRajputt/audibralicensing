"use client";
import { useRouter } from "next/navigation";

export default function GoogleLoginButton({ role }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/auth/login?role=${role}`);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full px-4 py-2 bg-accent text-accent-foreground border rounded-md hover:bg-accent/80 transition-colors"
    >
      Go to {role === "creator" ? "Creator" : "Admin"} Dashboard
    </button>
  );
}
