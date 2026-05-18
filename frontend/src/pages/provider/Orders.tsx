import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { orderApi, type BookingOrder } from '@/lib/orderApi';

const revenueFromOrders = (orders: BookingOrder[]) => {
  return orders.reduce((sum, order) => {
    const value = Number(String(order.price || '').replace(/[^\d.]/g, ''));
    return sum + (Number.isNaN(value) ? 0 : value);
  }, 0);
};

export default function ProviderOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<BookingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await orderApi.getProviderOrders();
        setOrders(Array.isArray(result) ? result : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load provider orders');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const inProgress = orders.filter((o) => o.status === 'confirmed' || o.status === 'in_transit').length;
    const completed = orders.filter((o) => o.status === 'delivered').length;
    return {
      total: orders.length,
      inProgress,
      completed,
      revenue: revenueFromOrders(orders),
    };
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'in_transit':
      case 'confirmed':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'requested':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default:
        return 'text-red-400 bg-red-400/10 border-red-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col font-sans">
      <div className="max-w-6xl w-full mx-auto">
        
        {/* Back navigation */}
        <button 
          onClick={() => navigate('/provider/home')}
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> 
          Back to Provider Workspace
        </button>

        {/* Page Header */}
        <div className="space-y-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Order Fulfillment</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight md:text-4xl text-white">Your Orders</h1>
          <p className="text-sm text-neutral-400">Track standard cylinder orders, deliveries, and payment settlements.</p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200 mb-6">{error}</div>
        ) : null}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="liquid-glass border border-white/10 p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <Package className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-3xl font-black mb-1">{stats.total}</p>
            <p className="text-xs text-neutral-400 uppercase font-bold">Total Bookings</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }} className="liquid-glass border border-white/10 p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-black mb-1">{stats.inProgress}</p>
            <p className="text-xs text-neutral-400 uppercase font-bold">In Progress</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="liquid-glass border border-white/10 p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-black mb-1">{stats.completed}</p>
            <p className="text-xs text-neutral-400 uppercase font-bold">Delivered</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="liquid-glass border border-white/10 p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <AlertCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-black mb-1">₹{stats.revenue.toFixed(0)}</p>
            <p className="text-xs text-neutral-400 uppercase font-bold">Gross Revenue</p>
          </motion.div>
        </div>

        {/* Orders Table Container */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="liquid-glass border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-400">Tracking Code</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-400">Customer ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-400">Fill Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-400">Price (₹)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-400">Payment Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-neutral-400">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-6 py-6 text-neutral-400 text-sm" colSpan={6}>Loading orders...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-neutral-400 text-sm text-center" colSpan={6}>No orders received yet.</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-t border-white/5 hover:bg-white/[0.02] transition">
                      <td className="px-6 py-4 font-mono text-sm text-neutral-200">{order.tracking_id}</td>
                      <td className="px-6 py-4 text-sm text-neutral-300">{order.buyer_id?.slice(0, 8) || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-neutral-400">{order.fill_level || 'Standard refill'}</td>
                      <td className="px-6 py-4 font-semibold text-white">₹{order.price}</td>
                      <td className="px-6 py-4 text-xs text-neutral-300 uppercase">
                        {(order.payment_mode || 'upi')} • {(order.payment_status || 'paid_test')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
