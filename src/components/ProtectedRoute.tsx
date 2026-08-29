import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router';
import type { ReactNode } from 'react';

/**
 * ProtectedRoute — redirects to /sign-in if the user isn't authenticated.
 *
 * If Clerk isn't configured at all (VITE_CLERK_PUBLISHABLE_KEY missing),
 * this falls back to render-as-authenticated so the local dev preview keeps
 * working. Production must have the key set.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const clerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const location = useLocation();

  if (!clerkConfigured) {
    return <>{children}</>;
  }

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" state={{ from: location.pathname }} replace />
      </SignedOut>
    </>
  );
}

/**
 * Hook that tells the app whether it's running with real Clerk auth or a stub.
 * Useful for hiding "Sign out" buttons in preview mode, etc.
 */
export function useAuthMode(): 'clerk' | 'stub' {
  const clerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  return clerkConfigured ? 'clerk' : 'stub';
}

/**
 * Convenience: are we authenticated? Wraps useAuth for the stub case.
 */
export function useIsAuthenticated(): boolean {
  const clerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const { isSignedIn } = useAuth();
  if (!clerkConfigured) return true;
  return isSignedIn === true;
}
