import { useSession } from "next-auth/react";

export default function NewFeedbackPage() {
  const { data: session } = useSession();
  // Use session.user.email for all feedback logic
} 