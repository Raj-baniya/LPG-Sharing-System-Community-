import React, { useState, useEffect } from 'react';
import { LPGTracker } from '../components/LPGTracker';
import { LPGAlertNotification } from '../components/LPGAlertNotification';
import { TrendingUp, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';
import { getToken } from '@/lib/trustAuth';
import { API_ROOT } from '@/lib/apiBase';

interface ModelMetric {
  metric_date: string;
  total_predictions: number;
  accurate_predictions: number;
  average_accuracy_percentage: number;
  average_error_days: number;
}

interface OverallMetrics {
  totalPredictions: number;
  accuratePredictions: number;
  accuracy_percentage: string;
  average_error_days: string;
}

export const LPGPredictionPage: React.FC = () => {
  const [metrics, setMetrics] = useState<OverallMetrics | null>(null);
  const [historicalMetrics, setHistoricalMetrics] = useState<ModelMetric[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const API_BASE = API_ROOT;
  const token = getToken();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`${API_BASE}/lpg/metrics/model`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setMetrics(data.metrics.overall);
          setHistoricalMetrics(data.metrics.historical);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, [API_BASE, token]);

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white font-sans selection:bg-neutral-800 selection:text-white pb-16">
      {/* Alert Notification Bell */}
      <LPGAlertNotification token={token || ''} apiBase={API_BASE} pollInterval={60000} />

      {/* Modern Lumina Noir Header */}
      <div className="border-b border-white/5 bg-white/[0.01] py-10 px-6 md:px-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-black">
                Predictive AI Engine
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3">
              LPG Prediction System
            </h1>
            <p className="text-sm text-neutral-400 mt-2">
              Deep usage learning & intelligent low-stock alerts before your cylinder runs dry.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
            <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div className="text-left">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black">Model Status</p>
              <p className="text-xs font-bold text-emerald-400">Online & Optimized</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10 md:px-8">
        {/* Model Performance Metrics */}
        {!loadingMetrics && metrics && (
          <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {/* Total Predictions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-white/20 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-xs font-black uppercase tracking-widest">Total Predictions</p>
                  <p className="text-3xl font-black text-white mt-3">
                    {metrics.totalPredictions}
                  </p>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 text-blue-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Accurate Predictions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-white/20 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-xs font-black uppercase tracking-widest">Accurate Runs</p>
                  <p className="text-3xl font-black text-emerald-400 mt-3">
                    {metrics.accuratePredictions}
                  </p>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Accuracy Percentage */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-white/20 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-xs font-black uppercase tracking-widest">Accuracy Rate</p>
                  <p className="text-3xl font-black text-violet-400 mt-3">
                    {metrics.accuracy_percentage}%
                  </p>
                </div>
                <div className="bg-violet-500/10 p-3 rounded-xl border border-violet-500/20 text-violet-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Average Error */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-white/20 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-xs font-black uppercase tracking-widest">Avg Error Margin</p>
                  <p className="text-3xl font-black text-amber-500 mt-3">
                    ±{metrics.average_error_days} Days
                  </p>
                </div>
                <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-amber-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* How it works banner */}
        <div className="bg-white/[0.02] border border-white/5 border-l-4 border-l-blue-500 rounded-2xl p-6 mb-10 backdrop-blur-md">
          <h2 className="text-lg font-bold text-white mb-3 tracking-tight">How the Prediction System Works</h2>
          <ul className="text-neutral-400 space-y-2 text-sm leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-black">01.</span>
              <span><strong>Register Nodes:</strong> Add your LPG cylinders with current weight levels and capacities to the network.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-black">02.</span>
              <span><strong>Usage Logging:</strong> Log daily gas usage or let automated meters stream the usage data seamlessly.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-black">03.</span>
              <span><strong>Predict Exhaustion:</strong> Call the ML engine to evaluate historical daily averages and output predicted empty dates.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-black">04.</span>
              <span><strong>Intelligent Alerts:</strong> When empty date fall within your threshold (e.g. 7 days), low-stock warnings trigger instantly.</span>
            </li>
          </ul>
        </div>

        {/* LPG Tracker Component Wrapper */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <LPGTracker />
        </div>

        {/* Feedback Section */}
        <div className="bg-white/[0.02] border border-white/5 border-l-4 border-l-amber-500 rounded-2xl p-6 mt-10 backdrop-blur-md">
          <h2 className="text-lg font-bold text-white mb-2 tracking-tight flex items-center gap-2">
            <span>🤖 Train the Predictive Prediction Engine</span>
          </h2>
          <p className="text-neutral-400 text-sm mb-4 leading-relaxed">
            Predictive accuracy improves with local network training. Once a cylinder runs dry, submitting its exact depletion date feeds our local machine learning model, optimizing forecast accuracy for you and your neighborhood.
          </p>
          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
            <p className="text-xs text-neutral-400 leading-5">
              <strong className="text-amber-400 uppercase tracking-widest font-black text-[10px] block mb-1">To Submit Feedback:</strong>
              Go to the pending feedback section inside your active cylinder dashboard. Confirm actual depletion dates to contribute to global network optimization.
            </p>
          </div>
        </div>

        {/* Historical Metrics Chart */}
        {historicalMetrics.length > 0 && (
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 mt-10 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-5">Predictive Model Run History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-4 text-left text-neutral-400 font-black text-xs uppercase tracking-widest">Date Checked</th>
                    <th className="px-4 py-4 text-center text-neutral-400 font-black text-xs uppercase tracking-widest">Total Predictions</th>
                    <th className="px-4 py-4 text-center text-neutral-400 font-black text-xs uppercase tracking-widest">Accurate Hits</th>
                    <th className="px-4 py-4 text-center text-neutral-400 font-black text-xs uppercase tracking-widest">Accuracy</th>
                    <th className="px-4 py-4 text-center text-neutral-400 font-black text-xs uppercase tracking-widest">Average Error</th>
                  </tr>
                </thead>
                <tbody>
                  {historicalMetrics.slice(0, 10).map((metric, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.01] transition-all">
                      <td className="px-4 py-4 text-white font-medium">
                        {new Date(metric.metric_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-4 text-center text-neutral-300 font-bold">
                        {metric.total_predictions}
                      </td>
                      <td className="px-4 py-4 text-center text-emerald-400 font-bold">
                        {metric.accurate_predictions}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                          {metric.average_accuracy_percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-neutral-300">
                        ±{parseFloat(String(metric.average_error_days)).toFixed(2)} days
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LPGPredictionPage;

