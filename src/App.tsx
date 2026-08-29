import { Routes, Route } from 'react-router';
import { Suspense, lazy } from 'react';
import Layout from '@/components/Layout';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const AssessmentPage = lazy(() => import('@/pages/AssessmentPage'));
const ResultsPage = lazy(() => import('@/pages/ResultsPage'));
const MethodPage = lazy(() => import('@/pages/MethodPage'));
const GetStartedPage = lazy(() => import('@/pages/GetStartedPage'));
const OrgDashboardPage = lazy(() => import('@/pages/OrgDashboardPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

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
          <Route path="/get-started" element={<GetStartedPage />} />
          <Route path="/org/:slug/dashboard" element={<OrgDashboardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
