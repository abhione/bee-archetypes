import { Routes, Route } from 'react-router';
import { Suspense, lazy } from 'react';
import Layout from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const AssessmentPage = lazy(() => import('@/pages/AssessmentPage'));
const ResultsPage = lazy(() => import('@/pages/ResultsPage'));
const MethodPage = lazy(() => import('@/pages/MethodPage'));
const GetStartedPage = lazy(() => import('@/pages/GetStartedPage'));
const OrgDashboardPage = lazy(() => import('@/pages/OrgDashboardPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const SignInPage = lazy(() => import('@/pages/SignInPage'));
const SignUpPage = lazy(() => import('@/pages/SignUpPage'));
const DashboardHubPage = lazy(() => import('@/pages/DashboardHubPage'));

function LoadingFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-hive-mist font-serif text-lg italic">Loading…</div>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/results/:token" element={<ResultsPage />} />
          <Route path="/method" element={<MethodPage />} />

          {/* Clerk auth routes (Clerk's SignIn/SignUp components handle sub-paths internally) */}
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />

          {/* Signup wizard — must be signed in to create/attach an org */}
          <Route
            path="/get-started"
            element={
              <ProtectedRoute>
                <GetStartedPage />
              </ProtectedRoute>
            }
          />

          {/* Signed-in dashboard hub — lists user's orgs */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardHubPage />
              </ProtectedRoute>
            }
          />

          {/* Org-specific dashboard */}
          <Route
            path="/org/:slug/dashboard"
            element={
              <ProtectedRoute>
                <OrgDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
