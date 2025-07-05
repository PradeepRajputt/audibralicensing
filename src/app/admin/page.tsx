
import { redirect } from 'next/navigation';

// This page just redirects to the default admin dashboard view.
export default function AdminRootPage() {
  redirect('/admin/overview');
}
