import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Currently, this middleware does nothing and just proceeds.
  // You can add logic here for redirects, rewriting URLs,
  // adding headers, or handling authentication.
  return NextResponse.next()
}
 
// See "Matching Paths" below to learn more
export const config = {
  // The matcher is empty, so this middleware will not run on any path.
  // This is a placeholder for when you want to add specific routes.
  matcher: [],
}
