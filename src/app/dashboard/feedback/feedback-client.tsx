import { useSession } from "next-auth/react";

export function FeedbackClientPage() {
  const { data: session } = useSession();
  // Use session.user.email for all feedback logic
} 