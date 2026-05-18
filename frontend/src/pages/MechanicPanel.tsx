import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MapPin } from 'lucide-react';
import { emergencyApi } from '@/lib/emergencyApi';
import { useTheme } from '@/context/ThemeContext';

export default function MechanicPanel() {
  const [requests, setRequests] = useState<any[]>([]);
  const [error, setError] = useState('');
  const { theme, toggleTheme } = useTheme();
  const [acceptedIds, setAcceptedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const run = async () => {
      try {
        const res = await emergencyApi.listRequests();
        setRequests(res.requests || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load requests');
      }
    };
    run();
  }, []);

  const handleAccept = (id: string) => {
    setAcceptedIds(prev => ({ ...prev, [id]: true }));
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6 md:p-12 transition-colors">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-light">Provider Panel</h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-[var(--glass-border)] text-[var(--text-primary)] transition-all"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <span className="material-symbols-outlined !text-xl leading-none">
            {theme === 'light' ? 'dark_mode' : 'light_mode'}
          </span>
        </button>
      </div>

      {error ? <div className="text-red-400 mb-4">{error}</div> : null}

      <div className="grid md:grid-cols-2 gap-6">
        {requests.map((request) => (
          <Card key={request.id} className="liquid-glass border-white/20">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">Emergency #{request.id.slice(0, 8)}</CardTitle>
                <span className={`text-sm font-medium ${acceptedIds[request.id] ? 'text-emerald-400' : 'text-red-400'}`}>
                  {acceptedIds[request.id] ? 'assigned' : request.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-3 font-light">
                <MapPin className="w-4 h-4" />
                <span>{request.location || 'Unknown location'}</span>
              </div>
              <div className="text-sm text-[var(--text-secondary)] mb-6">
                {request.intensity || '-'} · {request.leakage_sound || '-'} · {request.duration || '-'}
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={() => handleAccept(request.id)}
                  disabled={acceptedIds[request.id]}
                  className={`flex-1 text-black font-medium text-sm transition-all ${
                    acceptedIds[request.id] ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white'
                  }`}
                >
                  {acceptedIds[request.id] ? 'Accepted ✅' : 'Accept Job'}
                </Button>
                <Button 
                  onClick={() => handleReject(request.id)}
                  variant="outline" 
                  className="flex-1 text-sm text-red-400 border-red-500/20 hover:bg-red-500/10"
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
