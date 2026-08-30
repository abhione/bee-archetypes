import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import {
  SignedIn,
  SignedOut,
  UserButton,
  OrganizationSwitcher,
} from '@clerk/clerk-react';
import { Menu, X } from 'lucide-react';

const CLERK_ENABLED = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-honeycomb">
      <Header transparent={isLanding} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Header({ transparent }: { transparent?: boolean }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 backdrop-blur-md border-b transition-colors',
        transparent
          ? 'bg-hive-black/40 border-hive-slate/40'
          : 'bg-hive-black/85 border-hive-slate/60',
      )}
    >
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <HexIcon className="text-hive-honey" />
          <span className="font-serif text-lg font-medium tracking-tight text-hive-cream">
            Bee Archetypes
          </span>
        </Link>
        <div className="md:hidden flex items-center gap-2">
          <Link
            to="/get-started"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-pill bg-hive-honey text-hive-black text-xs font-medium hover:bg-hive-honey/90 transition-colors"
          >
            For teams
          </Link>
          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-card text-hive-mist hover:text-hive-cream hover:bg-hive-charcoal/60 transition-colors"
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileNavOpen}
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-hive-mist">
          <Link to="/method" className="hover:text-hive-cream transition-colors">
            Method
          </Link>

          {CLERK_ENABLED ? (
            <>
              <SignedOut>
                <Link to="/sign-in" className="hover:text-hive-cream transition-colors">
                  Sign in
                </Link>
                <Link
                  to="/sign-up"
                  className="px-4 py-2 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 transition-colors"
                >
                  Bring to your team
                </Link>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard" className="hover:text-hive-cream transition-colors">
                  Dashboard
                </Link>
                <div className="flex items-center gap-3">
                  <OrganizationSwitcher
                    hidePersonal={false}
                    afterCreateOrganizationUrl={(org) =>
                      `/org/${org.slug ?? org.id}/dashboard`
                    }
                    afterSelectOrganizationUrl={(org) =>
                      `/org/${org.slug ?? org.id}/dashboard`
                    }
                    appearance={{
                      elements: {
                        organizationSwitcherTrigger:
                          'text-hive-mist hover:text-hive-cream',
                      },
                    }}
                  />
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        userButtonAvatarBox: 'h-8 w-8',
                      },
                    }}
                  />
                </div>
              </SignedIn>
            </>
          ) : (
            <Link
              to="/get-started"
              className="px-4 py-2 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 transition-colors"
            >
              Bring to your team
            </Link>
          )}
        </nav>
      </div>
      {mobileNavOpen && (
        <div className="md:hidden border-t border-hive-slate/40 bg-hive-black/95 backdrop-blur">
          <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col gap-3 text-sm text-hive-mist">
            <Link
              to="/method"
              onClick={() => setMobileNavOpen(false)}
              className="py-2 hover:text-hive-cream transition-colors"
            >
              Method
            </Link>
            {CLERK_ENABLED ? (
              <>
                <SignedOut>
                  <Link
                    to="/sign-in"
                    onClick={() => setMobileNavOpen(false)}
                    className="py-2 hover:text-hive-cream transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/sign-up"
                    onClick={() => setMobileNavOpen(false)}
                    className="py-2 px-4 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 transition-colors text-center"
                  >
                    Bring to your team
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileNavOpen(false)}
                    className="py-2 hover:text-hive-cream transition-colors"
                  >
                    Dashboard
                  </Link>
                </SignedIn>
              </>
            ) : (
              <Link
                to="/get-started"
                onClick={() => setMobileNavOpen(false)}
                className="py-2 px-4 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 transition-colors text-center"
              >
                Bring to your team
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-hive-slate/40 mt-24">
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-hive-mist">
        <div className="flex items-center gap-2">
          <HexIcon className="text-hive-honey/70 w-4 h-4" />
          <span>
            Backed by{' '}
            <span className="text-hive-cream font-medium">Hive Enterprises</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/method" className="hover:text-hive-cream transition-colors">
            Method
          </Link>
          <a
            href="https://www.linkedin.com/company/hive-enterprises/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-hive-cream transition-colors"
          >
            LinkedIn
          </a>
          <span className="text-hive-mist/60">© 2026 Hive Enterprises</span>
        </div>
      </div>
    </footer>
  );
}

function HexIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-5 h-5', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2 3 7v10l9 5 9-5V7l-9-5z" />
    </svg>
  );
}