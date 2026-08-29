/**
 * ProtectedRoute + auth utility hooks.
 *
 * WHO USES THIS
 * =============
 * - `/get-started` (buyer signup wizard)
 * - `/dashboard` (signed-in landing hub)
 * - `/org/:slug/dashboard` (per-org dashboard)
 *
 * See `src/App.tsx` for the routes that wrap children in <ProtectedRoute>.
 *
 * STUB MODE
 * =========
 * When `VITE_CLERK_PUBLISHABLE_KEY` is unset, `<ClerkProvider>` isn't mounted in
 * `main.tsx`, so calling `<SignedIn>`/`<SignedOut>` would throw. We detect that
 * via the env var directly and short-circuit to render children as if signed-in.
 *
 * This lets developers preview the full app UI without a Clerk instance. It is
 * NOT a security bypass — the production build always has the key set (baked in
 * via the Fly `--build-arg`).
 *
 * REDIRECT BEHAVIOR
 * =================
 * When signed out, we <Navigate> to `/sign-in` and preserve the intended path
 * in `state.from` so Clerk can send the user back after sign-in. See
 * `SignInPage.tsx`'s `redirectUrl` prop.
 */
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
