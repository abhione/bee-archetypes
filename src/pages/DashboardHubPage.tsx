import { Link } from 'react-router';
import {
  useOrganizationList,
  useUser,
  OrganizationSwitcher,
} from '@clerk/clerk-react';
import { Plus, Building2, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * DashboardHubPage — landed-here-after-signin page.
 *
 * Shows the user's Clerk organizations. Each org has a slug that maps to
 * /org/:slug/dashboard. If the user has no orgs, they see a big CTA to
 * create one (which routes them into /get-started).
 */
export default function DashboardHubPage() {
  const { user } = useUser();
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: { infinite: true, pageSize: 20 },
  });

  const orgs = userMemberships?.data ?? [];
  const orgCount = orgs.length;

  return (
    <div className="mx-auto max-w-4xl px-6 pt-12 pb-24">
      {/* Header */}
      <motion.header
        initial={{ opacity: 1, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div>
          <p className="text-sm uppercase tracking-widest text-hive-honey">Your workspaces</p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl text-hive-cream">
            {user?.firstName ? `Welcome back, ${user.firstName}.` : 'Welcome back.'}
          </h1>
          <p className="mt-2 text-hive-mist">
            {orgCount === 0
              ? 'You have no hives yet. Create one to see your team on the coverage map.'
              : orgCount === 1
                ? 'You belong to one hive.'
                : `You belong to ${orgCount} hives.`}
          </p>
        </div>
        <OrganizationSwitcher
          hidePersonal
          appearance={{
            variables: {
              colorPrimary: '#E8A33F',
              colorBackground: '#1A1A1D',
              colorText: '#F5F1E8',
            },
            elements: {
              organizationSwitcherTrigger:
                'text-hive-cream border border-hive-slate/50 rounded-pill px-4 py-2 hover:bg-hive-charcoal',
            },
          }}
        />
      </motion.header>

      {/* Org list */}
      <motion.section
        initial={{ opacity: 1, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {!isLoaded && (
          <p className="text-hive-mist italic">Loading your hives…</p>
        )}

        {isLoaded && orgs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orgs.map((membership) => {
              const org = membership.organization;
              return (
                <Link
                  key={org.id}
                  to={`/org/${org.slug ?? org.id}/dashboard`}
                  className="group p-6 rounded-card border border-hive-slate/50 bg-hive-charcoal/60 hover:border-hive-honey hover:bg-hive-charcoal transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-pill bg-hive-honey/10 border border-hive-honey/40 flex-shrink-0 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-hive-honey" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-serif text-xl text-hive-cream truncate">
                          {org.name}
                        </h3>
                        <p className="mt-1 text-xs uppercase tracking-widest text-hive-mist">
                          {membership.role === 'org:admin' ? 'Owner' : 'Member'}
                          {org.membersCount != null && (
                            <>
                              {' · '}
                              {org.membersCount} member{org.membersCount === 1 ? '' : 's'}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-hive-mist group-hover:text-hive-honey mt-2 flex-shrink-0" />
                  </div>
                </Link>
              );
            })}

            {/* Add new hive card */}
            <Link
              to="/get-started"
              className="p-6 rounded-card border border-dashed border-hive-slate/50 bg-transparent hover:border-hive-honey hover:bg-hive-charcoal/40 transition-colors flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-pill border border-hive-slate/60 flex items-center justify-center">
                <Plus className="w-4 h-4 text-hive-mist" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-hive-cream">Create a new hive</h3>
                <p className="text-xs text-hive-mist mt-0.5">
                  For a different team, client, or org
                </p>
              </div>
            </Link>
          </div>
        )}

        {isLoaded && orgs.length === 0 && (
          <div className="p-8 rounded-card border border-hive-slate/40 bg-hive-charcoal/40 text-center">
            <div className="w-16 h-16 rounded-pill bg-hive-honey/10 border border-hive-honey/40 mx-auto flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-hive-honey" />
            </div>
            <h2 className="font-serif text-3xl text-hive-cream mb-3">
              No hives yet.
            </h2>
            <p className="text-hive-mist mb-8 max-w-lg mx-auto">
              Start your first hive to bring the Bee Archetypes to your team.
            </p>
            <Link
              to="/get-started"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 transition-colors"
            >
              Bring to your team
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </motion.section>

      {/* Individual assessment nudge */}
      <motion.section
        initial={{ opacity: 1, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-16 p-8 rounded-card border border-hive-slate/50 bg-hive-charcoal/40"
      >
        <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
          <div>
            <p className="text-xs uppercase tracking-widest text-hive-mist mb-2">
              Individual assessment
            </p>
            <h3 className="font-serif text-2xl text-hive-cream">
              Haven't found your own bee yet?
            </h3>
            <p className="mt-2 text-hive-mist max-w-lg">
              Take the 6-minute assessment. It's the same one you'll send your team.
            </p>
          </div>
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-hive-slate/60 text-hive-cream hover:bg-hive-slate transition-colors flex-shrink-0"
          >
            Take the assessment
          </Link>
        </div>
      </motion.section>
    </div>
  );
}