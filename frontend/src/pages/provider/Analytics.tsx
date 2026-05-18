import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Target, Zap, ArrowLeft } from 'lucide-react';

export default function ProviderAnalytics() {
  const navigate = useNavigate();

  const metrics = [
    { label: 'Response Rate', value: '96%', icon: TrendingUp, color: 'emerald' },
    { label: 'Customer Rating', value: '4.8/5', icon: Award, color: 'amber' },
    { label: 'Completion Rate', value: '98%', icon: Target, color: 'cyan' },
    { label: 'Average Response', value: '12 min', icon: Zap, color: 'blue' },
  ];

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

        {/* Header */}
        <div className="space-y-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Performance</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight md:text-4xl text-white">Analytics Dashboard</h1>
          <p className="text-sm text-neutral-400">Review your response times, rating trend graphs, and successful fulfillment volume.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="liquid-glass border border-white/10 p-8 rounded-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <metric.icon className="w-6 h-6 text-cyan-400" />
                <TrendingUp className="w-4 h-4 text-neutral-600" />
              </div>
              <p className="text-3xl font-black mb-1 text-white">{metric.value}</p>
              <p className="text-xs text-neutral-400 uppercase font-bold">{metric.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass border border-white/10 p-8 rounded-3xl shadow-2xl"
        >
          <h2 className="text-xl font-bold mb-4 text-white">Response Time Trend</h2>
          <div className="h-64 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-neutral-500 text-sm">
            Live telemetry chart rendering after next dispatch sync...
          </div>
        </motion.div>
      </div>
    </div>
  );
}
