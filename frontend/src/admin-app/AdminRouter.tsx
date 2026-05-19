import { Routes, Route, Navigate } from 'react-router-dom';
import AdminShell from './layout/AdminShell';
import Dashboard from './pages/Dashboard';
import DisputesList from './pages/DisputesList';
import IdReviewQueue from './pages/IdReviewQueue';
import TrustOverview from './pages/TrustOverview';
import TrustOverride from './pages/TrustOverride';
import Suspensions from './pages/Suspensions';
import AuditLogs from './pages/AuditLogs';
import AdminProfile from './pages/AdminProfile';
import Community from '@/pages/Community';
import CreatePost from '@/pages/CreatePost';
import PostDetails from '@/pages/PostDetails';

export default function AdminRouter() {
  return (
    <AdminShell>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trust-overview" element={<TrustOverview />} />
        <Route path="/disputes" element={<DisputesList />} />
        <Route path="/id-review-queue" element={<IdReviewQueue />} />
        <Route path="/trust-override" element={<TrustOverride />} />
        <Route path="/suspensions" element={<Suspensions />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/profile" element={<AdminProfile />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/create" element={<CreatePost />} />
        <Route path="/community/post/:id" element={<PostDetails />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminShell>
  );
}
