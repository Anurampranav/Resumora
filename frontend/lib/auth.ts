/**
 * Auth boundary for the frontend. Every non-component module (like api.ts)
 * reads the session token through this file, never through a Clerk hook
 * directly — hooks only work inside React components, and this needs to
 * be callable from plain functions too.
 *
 * Backed by Clerk's client-side singleton (`window.Clerk`), which
 * ClerkProvider attaches once its script has loaded. This is Clerk's own
 * documented pattern for accessing the session outside the React tree —
 * see https://clerk.com/docs/references/javascript/clerk
 *
 * Components should prefer Clerk's `useUser()` / `useAuth()` hooks
 * directly for anything reactive (e.g. showing the signed-in user's name);
 * this file is specifically for the token, needed by fetch calls.
 */

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: (options?: { template?: string }) => Promise<string | null>;
      } | null;
      user?: {
        id: string;
        primaryEmailAddress?: { emailAddress: string } | null;
        fullName?: string | null;
        imageUrl?: string;
      } | null;
      loaded?: boolean;
    };
  }
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

/** Waits briefly for Clerk's script to finish loading if it hasn't yet
 * (e.g. a fetch fired very early on page load). */
async function waitForClerk(maxWaitMs = 3000): Promise<void> {
  const start = Date.now();
  while (!window.Clerk?.loaded && Date.now() - start < maxWaitMs) {
    await new Promise((r) => setTimeout(r, 50));
  }
}

export async function getToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  await waitForClerk();
  if (!window.Clerk?.session) return null;
  try {
    return await window.Clerk.session.getToken();
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.Clerk?.session);
}

/** Synchronous, best-effort user info for display (e.g. sidebar profile
 * card) when a React hook isn't convenient. Prefer `useUser()` inside
 * components — this only works once Clerk has loaded client-side. */
export function currentUser(): AuthUser | null {
  if (typeof window === "undefined" || !window.Clerk?.user) return null;
  const u = window.Clerk.user;
  const email = u.primaryEmailAddress?.emailAddress ?? "";
  return {
    id: u.id,
    email,
    fullName: u.fullName || email.split("@")[0] || "User",
    avatarUrl: u.imageUrl,
  };
}
