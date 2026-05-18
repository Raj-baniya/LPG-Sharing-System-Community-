import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingDown, Calendar, Plus } from 'lucide-react';
import { getToken } from '@/lib/trustAuth';
import { API_ROOT } from '@/lib/apiBase';

interface Cylinder {
  id: string;
  cylinder_id: string;
  current_weight_kg: number;
  max_capacity_kg: number;
  status: string;
  last_refill_date: string;
  created_at: string;
  updated_at: string;
}

interface Prediction {
  id: string;
  predicted_empty_days: number;
  predicted_empty_date: string;
  daily_avg_usage_kg: number;
  confidence_score: number;
  alert_status: boolean;
}

interface Alert {
  id: string;
  alert_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const LPGTracker: React.FC = () => {
  const [cylinders, setCylinders] = useState<Cylinder[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCylinder, setSelectedCylinder] = useState<Cylinder | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [usageInput, setUsageInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    cylinder_id: '',
    current_weight_kg: '',
    max_capacity_kg: '20',
  });

  const API_BASE = API_ROOT;
  const token = getToken();

  const fetchCylinders = async () => {
    if (!token) {
      setErrorMessage('Authentication token missing. Please login again.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/lpg/cylinders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setErrorMessage('');
        setCylinders(data.data);
        if (data.data.length > 0) {
          setSelectedCylinder(data.data[0]);
          fetchPredictions(data.data[0].id);
        }
      } else {
        setErrorMessage(data.message || 'Failed to load cylinders.');
      }
    } catch (error) {
      console.error('Error fetching cylinders:', error);
      setErrorMessage('Failed to load cylinders. Please try again.');
    }
  };

  const fetchPredictions = async (cylinderId: string) => {
    try {
      const response = await fetch(`${API_BASE}/lpg/predict/${cylinderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success && data.data) {
        setPredictions((prev) => ({ ...prev, [cylinderId]: data.data }));
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const fetchAlerts = async () => {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/lpg/alerts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  useEffect(() => {
    fetchCylinders();
    fetchAlerts();
    setLoading(false);
  }, []);

  const handleAddCylinder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setErrorMessage('Authentication token missing. Please login again.');
      return;
    }

    const cylinderId = formData.cylinder_id.trim();
    const currentWeight = parseFloat(formData.current_weight_kg);
    const maxCapacity = parseFloat(formData.max_capacity_kg);

    if (!cylinderId || Number.isNaN(currentWeight) || Number.isNaN(maxCapacity)) {
      setErrorMessage('Please enter a valid cylinder ID and weight values.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/lpg/cylinders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cylinder_id: cylinderId,
          current_weight_kg: currentWeight,
          max_capacity_kg: maxCapacity,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setErrorMessage('');
        setCylinders([...cylinders, data.data]);
        setSelectedCylinder(data.data);
        setFormData({ cylinder_id: '', current_weight_kg: '', max_capacity_kg: '20' });
        setShowAddForm(false);
      } else {
        setErrorMessage(data.message || 'Unable to add cylinder.');
      }
    } catch (error) {
      console.error('Error adding cylinder:', error);
      setErrorMessage('Unable to add cylinder. Please try again.');
    }
  };

  const handleLogUsage = async () => {
    if (!selectedCylinder || !usageInput) return;

    try {
      const response = await fetch(`${API_BASE}/lpg/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cylinder_id: selectedCylinder.cylinder_id,
          usage_kg: parseFloat(usageInput),
          usage_reason: 'daily_use',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setUsageInput('');
        // Refresh predictions
        if (selectedCylinder) {
          fetchPredictions(selectedCylinder.id);
        }
      }
    } catch (error) {
      console.error('Error logging usage:', error);
    }
  };

  const handlePredictNow = async () => {
    if (!selectedCylinder) return;

    try {
      const response = await fetch(`${API_BASE}/lpg/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cylinder_id: selectedCylinder.cylinder_id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPredictions((prev) => ({
          ...prev,
          [selectedCylinder.id]: data.data,
        }));
        if (data.data.alertTriggered) {
          fetchAlerts();
        }
      }
    } catch (error) {
      console.error('Error making prediction:', error);
    }
  };

  const handleMarkAlertRead = async (alertId: string) => {
    try {
      await fetch(`${API_BASE}/lpg/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchAlerts();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const getStatusColor = (days: number | null): string => {
    if (!days) return 'text-neutral-500';
    if (days <= 3) return 'text-red-400 font-black';
    if (days <= 7) return 'text-amber-400 font-black';
    return 'text-emerald-400 font-black';
  };

  const getStatusBgColor = (days: number | null): string => {
    if (!days) return 'bg-white/5 border border-white/10';
    if (days <= 3) return 'bg-red-500/10 border border-red-500/20';
    if (days <= 7) return 'bg-amber-500/10 border border-amber-500/20';
    return 'bg-emerald-500/10 border border-emerald-500/20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white/[0.01]">
        <div className="text-neutral-400 text-sm font-black uppercase tracking-widest animate-pulse">
          Loading LPG Tracker System...
        </div>
      </div>
    );
  }

  const currentPrediction = selectedCylinder
    ? predictions[selectedCylinder.id]
    : null;

  return (
    <div className="p-6 md:p-8 bg-[#0a0a0a] text-white">
      {/* Alerts Section */}
      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3.5 text-sm font-bold text-red-200 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      {alerts.length > 0 && (
        <div className="mb-8 space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border flex items-start gap-4 transition-all ${
                alert.is_read
                  ? 'bg-white/[0.02] border-white/5 text-neutral-400'
                  : 'bg-red-500/5 border-red-500/20 text-red-200'
              }`}
            >
              <AlertCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${alert.is_read ? 'text-neutral-500' : 'text-red-400'}`} />
              <div className="flex-1">
                <p className={`font-black text-xs uppercase tracking-widest ${alert.is_read ? 'text-neutral-400' : 'text-red-300'}`}>{alert.alert_type}</p>
                <p className="text-sm mt-1.5 leading-relaxed">{alert.message}</p>
                <p className="text-neutral-500 text-[10px] mt-2 font-black tracking-widest uppercase">
                  {new Date(alert.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </div>
              {!alert.is_read && (
                <button
                  onClick={() => handleMarkAlertRead(alert.id)}
                  className="bg-white text-black px-3 py-1.5 rounded-lg text-xs font-black hover:bg-neutral-200 transition-all"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cylinders List */}
        <div className="lg:col-span-1">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black uppercase tracking-widest text-neutral-400">Registered Nodes</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="p-2.5 bg-white text-black rounded-xl hover:bg-neutral-200 transition-all shadow-lg flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddCylinder} className="mb-6 p-4 bg-white/[0.03] border border-white/5 rounded-xl space-y-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-black text-neutral-500 mb-1.5">Cylinder Serial / ID</label>
                  <input
                    type="text"
                    placeholder="e.g. CYL-9082-Z"
                    value={formData.cylinder_id}
                    onChange={(e) =>
                      setFormData({ ...formData, cylinder_id: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-[#0e0e0e] text-white placeholder:text-neutral-600 text-sm focus:border-white/20 outline-none transition-all"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-black text-neutral-500 mb-1.5">Weight (kg)</label>
                    <input
                      type="number"
                      placeholder="3.5"
                      step="0.1"
                      value={formData.current_weight_kg}
                      onChange={(e) =>
                        setFormData({ ...formData, current_weight_kg: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-[#0e0e0e] text-white placeholder:text-neutral-600 text-sm focus:border-white/20 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-black text-neutral-500 mb-1.5">Capacity (kg)</label>
                    <input
                      type="number"
                      placeholder="20"
                      value={formData.max_capacity_kg}
                      onChange={(e) =>
                        setFormData({ ...formData, max_capacity_kg: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-[#0e0e0e] text-white placeholder:text-neutral-600 text-sm focus:border-white/20 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-white text-black py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all"
                >
                  Register Node
                </button>
              </form>
            )}

            <div className="space-y-2">
              {cylinders.length === 0 ? (
                <div className="text-center py-6 text-neutral-500 text-xs font-medium">
                  No cylinders active. Click "+" to register one.
                </div>
              ) : (
                cylinders.map((cylinder) => (
                  <button
                    key={cylinder.id}
                    onClick={() => {
                      setSelectedCylinder(cylinder);
                      fetchPredictions(cylinder.id);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedCylinder?.id === cylinder.id
                        ? 'bg-white border-white text-black shadow-lg shadow-white/5'
                        : 'bg-white/[0.01] border-white/5 text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <p className="font-black text-sm tracking-tight">{cylinder.cylinder_id}</p>
                    <p className={`text-[10px] font-black tracking-widest uppercase mt-1 ${
                      selectedCylinder?.id === cylinder.id ? 'text-neutral-700' : 'text-neutral-500'
                    }`}>
                      Level: {cylinder.current_weight_kg} / {cylinder.max_capacity_kg} kg
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Prediction Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCylinder ? (
            <>
              {/* Current Status */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black tracking-tight text-white">
                    {selectedCylinder.cylinder_id}
                  </h2>
                  <span className="bg-white/5 text-white border border-white/10 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    Active Node
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/[0.03] border border-white/5 p-4 rounded-xl">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black mb-1">Current Weight</p>
                    <p className="text-3xl font-black text-emerald-400">
                      {selectedCylinder.current_weight_kg} <span className="text-sm font-black text-neutral-400">kg</span>
                    </p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 p-4 rounded-xl">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black mb-1">Max Capacity</p>
                    <p className="text-3xl font-black text-neutral-300">
                      {selectedCylinder.max_capacity_kg} <span className="text-sm font-black text-neutral-500">kg</span>
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">
                    <span>Depletion Ratio</span>
                    <span className="text-neutral-300">
                      {Math.round((selectedCylinder.current_weight_kg / selectedCylinder.max_capacity_kg) * 100)}% Remaining
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 border border-white/5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                      style={{
                        width: `${Math.min(100, Math.max(0, (selectedCylinder.current_weight_kg / selectedCylinder.max_capacity_kg) * 100))}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Log Usage */}
                <div className="mb-6 bg-white/[0.01] border border-white/5 rounded-xl p-4">
                  <label className="block text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-2">
                    Log Gas Consumption (kg)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 0.4"
                      value={usageInput}
                      onChange={(e) => setUsageInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-white/10 rounded-xl bg-[#0e0e0e] text-white placeholder:text-neutral-600 text-sm focus:border-white/20 outline-none transition-all"
                    />
                    <button
                      onClick={handleLogUsage}
                      className="px-6 py-2.5 bg-white text-black rounded-xl hover:bg-neutral-200 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-white/5"
                    >
                      Log
                    </button>
                  </div>
                </div>

                {/* Predict Button */}
                <button
                  onClick={handlePredictNow}
                  className="w-full py-3.5 bg-white text-black font-black text-sm uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5"
                >
                  <TrendingDown className="w-5 h-5" />
                  Evaluate Empty Date
                </button>
              </div>

              {/* Prediction Result */}
              {currentPrediction && (
                <div
                  className={`${getStatusBgColor(currentPrediction.predicted_empty_days)} rounded-2xl p-6 shadow-xl transition-all`}
                >
                  <h3 className="text-lg font-black uppercase tracking-widest mb-5 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span className={getStatusColor(currentPrediction.predicted_empty_days)}>
                      Forecasting Result
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black mb-1">Days Remaining</p>
                      <p
                        className={`text-4xl font-black ${getStatusColor(currentPrediction.predicted_empty_days)}`}
                      >
                        {currentPrediction.predicted_empty_days}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black mb-1">Empty Forecast</p>
                      <p className="text-xl font-bold text-white mt-1.5">
                        {new Date(currentPrediction.predicted_empty_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black mb-1">Avg Daily Burn</p>
                      <p className="text-xl font-bold text-white mt-1.5">
                        {currentPrediction.daily_avg_usage_kg.toFixed(2)} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black mb-1">Confidence Score</p>
                      <p className="text-xl font-bold text-white mt-1.5">
                        {(currentPrediction.confidence_score * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  {currentPrediction.predicted_empty_days <= 7 && (
                    <div className="mt-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-bounce" />
                      <p className="text-xs font-bold text-red-300">
                        Warning: Cylinder fuel depletion critical. Coordinate sharing exchange or order refill soon.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-12 text-center text-neutral-500">
              Select or register an active cylinder node to monitor predictive metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LPGTracker;

