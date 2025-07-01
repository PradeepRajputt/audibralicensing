
import { redirect } from 'next/navigation';

export default function LoginPage() {
  // Redirect to the homepage as the login functionality has been removed.
  redirect('/');
}
