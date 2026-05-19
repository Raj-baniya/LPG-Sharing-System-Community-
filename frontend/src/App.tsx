import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from '@/pages/Landing';
import RefillBooking from '@/pages/RefillBooking';
import Emergency from '@/pages/Emergency';
import EmergencyAssessment from '@/pages/EmergencyAssessment';
import Tracking from '@/pages/Tracking';
import Payment from '@/pages/Payment';
import ResourceSharing from '@/pages/ResourceSharing';
import AdminPanel from '@/pages/AdminPanel';
import AdminRouter from '@/admin-app/AdminRouter';
import { AdminProtectedRoute } from '@/admin-app/components/AdminProtectedRoute';
import UserHome from '@/pages/user/Home';
import ConsumerHome from '@/pages/consumer/Home';
import RegisterCylinder from '@/pages/RegisterCylinder';
import FindCylinder from '@/pages/FindCylinder';
import Chat from '@/pages/Chat';
import Profile from '@/pages/Profile';
import Community from '@/pages/Community';
import CreatePost from '@/pages/CreatePost';
import PostDetails from '@/pages/PostDetails';
import { LPGPredictionPage } from '@/pages/LPGPredictionPage';
import TrustLogin from '@/pages/trust/TrustLogin';
import OTPVerify from '@/pages/trust/OTPVerify';
import ProfileSetup from '@/pages/trust/ProfileSetup';
import TrustProfile from '@/pages/trust/TrustProfile';
import NearbyProviders from '@/pages/trust/NearbyProviders';
import RaiseDispute from '@/pages/trust/RaiseDispute';
import Disputes from '@/pages/trust/Disputes';
import DisputeDetails from '@/pages/trust/DisputeDetails';

// Provider Workspace imports
import ProviderHome from '@/pages/provider/ProviderHome';
import ProviderInitiatives from '@/pages/provider/Initiatives';
import ProviderOrders from '@/pages/provider/Orders';
import ProviderRequests from '@/pages/provider/Requests';
import ProviderAnalytics from '@/pages/provider/Analytics';
import ProviderProfile from '@/pages/provider/Profile';

import { AIChatbot } from './components/AIChatbot';
import { AuthRoute } from './components/trust/AuthRoute';
import { RoleRoute } from './components/trust/RoleRoute';
import { PublicOnlyRoute } from './components/trust/PublicOnlyRoute';
import { AuthenticatedRoute } from './components/trust/AuthenticatedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Core public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/emergency/assessment" element={<EmergencyAssessment />} />
        <Route path="/dashboard" element={<Navigate to="/consumer" replace />} />
        <Route path="/resources" element={<ResourceSharing />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/create" element={<CreatePost />} />
        <Route path="/community/post/:id" element={<PostDetails />} />
        <Route path="/onboarding/setup" element={<ProfileSetup />} />
        <Route path="/providers/nearby" element={<NearbyProviders />} />
        <Route path="/provider/:id" element={<Navigate to="/providers/nearby" replace />} />
        <Route path="/lpg-prediction" element={<LPGPredictionPage />} />

        {/* Route collapses / redirects */}
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/auth/login" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard/lpg" element={<Navigate to="/lpg-prediction" replace />} />

        {/* Public only guards */}
        <Route path="/login" element={<PublicOnlyRoute><TrustLogin /></PublicOnlyRoute>} />
        <Route path="/auth/otp-verify" element={<PublicOnlyRoute><OTPVerify /></PublicOnlyRoute>} />

        {/* Admin Modern Portal */}
        <Route 
          path="/admin/*" 
          element={
            <AdminProtectedRoute>
              <AdminRouter />
            </AdminProtectedRoute>
          } 
        />
        <Route path="/admin/legacy" element={<RoleRoute role="admin"><AdminPanel /></RoleRoute>} />
        
        <Route path="/mechanic" element={<Navigate to="/provider/home" replace />} />
        <Route path="/provider/home" element={<RoleRoute role="provider"><ProviderHome /></RoleRoute>} />
        <Route path="/provider/initiatives" element={<RoleRoute role="provider"><ProviderInitiatives /></RoleRoute>} />
        <Route path="/provider/orders" element={<RoleRoute role="provider"><ProviderOrders /></RoleRoute>} />
        <Route path="/provider/requests" element={<RoleRoute role="provider"><ProviderRequests /></RoleRoute>} />
        <Route path="/provider/analytics" element={<RoleRoute role="provider"><ProviderAnalytics /></RoleRoute>} />
        <Route path="/provider/profile" element={<RoleRoute role="provider"><ProviderProfile /></RoleRoute>} />
        <Route path="/provider/community" element={<RoleRoute role="provider"><Community /></RoleRoute>} />
        <Route path="/provider/community/create" element={<RoleRoute role="provider"><CreatePost /></RoleRoute>} />
        <Route path="/provider/community/post/:id" element={<RoleRoute role="provider"><PostDetails /></RoleRoute>} />
        <Route path="/consumer" element={<RoleRoute role="consumer"><ConsumerHome /></RoleRoute>} />

        {/* Session Auth Route guards */}
        <Route path="/user" element={<AuthRoute><UserHome /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><RegisterCylinder /></AuthRoute>} />
        <Route path="/find" element={<AuthRoute><FindCylinder /></AuthRoute>} />
        <Route path="/chat" element={<AuthRoute><Chat /></AuthRoute>} />
        <Route path="/profile" element={<AuthRoute><Profile /></AuthRoute>} />
        <Route path="/trust/me" element={<AuthRoute><TrustProfile /></AuthRoute>} />
        
        <Route path="/disputes" element={<AuthRoute><Disputes /></AuthRoute>} />
        <Route path="/disputes/:id" element={<AuthRoute><DisputeDetails /></AuthRoute>} />
        <Route path="/disputes/new/:exchangeId" element={<AuthRoute><RaiseDispute /></AuthRoute>} />
        
        <Route path="/payment" element={<AuthRoute><Payment /></AuthRoute>} />
        <Route path="/booking/:id" element={<AuthRoute><RefillBooking /></AuthRoute>} />

        <Route
          path="/tracking"
          element={(
            <AuthenticatedRoute>
              <Tracking />
            </AuthenticatedRoute>
          )}
        />
      </Routes>
      <AIChatbot />
    </Router>
  );
}

export default App;
