import { useEffect, useMemo, useState } from 'react';
import { RoleHub, type FeatureCard } from '@/components/RoleHub';
import { trustApi } from '@/lib/trustApi';
import { orderApi } from '@/lib/orderApi';
import { resourceApi } from '@/lib/resourceApi';
import { emergencyApi } from '@/lib/emergencyApi';
import { getToken } from '@/lib/trustAuth';
import { AuthenticatedRoute } from '@/components/trust/AuthenticatedRoute';

function ProviderHomeContent() {
  const token = getToken();

  const [loading, setLoading] = useState(true);
  const [trustScore, setTrustScore] = useState(0);
  const [activeRequestsCount, setActiveRequestsCount] = useState(0);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    const loadProviderData = async () => {
      setLoading(true);
      try {
        const [trustRes, ordersRes, resourcesRes, emergencyRes] = await Promise.all([
          trustApi.getMyTrust(),
          orderApi.getProviderOrders(),
          resourceApi.listResources(),
          emergencyApi.listRequests(),
        ]);

        setTrustScore(Number(trustRes.trust?.trustScore || 0));
        setTotalOrders(Array.isArray(ordersRes) ? ordersRes.length : 0);

        // Calculate own inventory
        const providerUserId = trustRes.trust?.userId;
        const myResources = (resourcesRes.resources || []).filter((r: any) => r.owner_id === providerUserId);
        setInventoryCount(myResources.length);

        // Calculate active emergency requests assigned or pending
        const myActiveRequests = (emergencyRes.requests || []).filter(
          (req: any) => req.status === 'assigned' || req.status === 'pending'
        ).length;
        setActiveRequestsCount(myActiveRequests);

      } catch (err) {
        console.error('Error loading provider workspace data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProviderData();
  }, [token]);

  const stats = useMemo(
    () => [
      { label: 'Trust Score', value: `${trustScore}/100`, loading },
      { label: 'Active SOS Alerts', value: String(activeRequestsCount), loading },
      { label: 'Inventory Items', value: String(inventoryCount), loading },
    ],
    [trustScore, activeRequestsCount, inventoryCount, loading]
  );

  const features: FeatureCard[] = [
    {
      title: 'NGO & Subsidy Initiatives',
      description: 'Publish and manage LPG initiatives sponsored by NGO, trust, and government subsidies.',
      to: '/provider/initiatives',
      badge: 'Subsidized',
    },
    {
      title: 'Order Fulfillment',
      description: 'Process and track standard and emergency bookings. Dispatch and manage order updates.',
      to: '/provider/orders',
      badge: 'Orders',
      stateLabel: totalOrders > 0 ? `${totalOrders} total` : 'No orders',
      stateTone: 'good',
    },
    {
      title: 'Priority SOS Queue',
      description: 'Review and accept urgent emergency leakage reports matching your radius.',
      to: '/provider/requests',
      badge: 'SOS',
      stateLabel: activeRequestsCount > 0 ? `${activeRequestsCount} urgent` : 'No active alerts',
      stateTone: activeRequestsCount > 0 ? 'danger' : 'neutral',
    },
    {
      title: 'Cylinder Swap Inventory',
      description: 'Create and update LPG cylinder availability for local resource-sharing swaps.',
      to: '/provider/resources',
      badge: 'Eco-Share',
    },
    {
      title: 'Provider Performance',
      description: 'Analyze completion rates, average response speeds, and sales growth.',
      to: '/provider/analytics',
      badge: 'Performance',
    },
    {
      title: 'Community Board',
      description: 'Post cylinder availability, share safety tips, and engage in local forums.',
      to: '/provider/community',
      badge: 'Forums',
    },
  ];

  return (
    <RoleHub
      roleTitle="Provider"
      subtitle="Unified reseller workspace. Manage subsidized listings, process priority SOS dispatch requests, track swap inventory, and review compliance logs."
      accentClass="border-cyan-300/50 bg-cyan-500/10 text-cyan-200"
      stats={stats}
      features={features}
    />
  );
}

export default function ProviderHome() {
  return (
    <AuthenticatedRoute>
      <ProviderHomeContent />
    </AuthenticatedRoute>
  );
}
