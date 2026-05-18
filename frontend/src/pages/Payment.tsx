import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function Payment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col items-center justify-center">
      <Card className="liquid-glass max-w-lg w-full border-white/20 text-center">
        <CardHeader className="flex flex-col items-center gap-4 pt-8">
           <CheckCircle className={`w-16 h-16 mb-2 transition-all ${success ? 'text-emerald-400 animate-bounce' : 'text-white'}`} />
           <CardTitle className="text-2xl">
             {success ? 'Payment Completed!' : 'Safe & Secure Payment'}
           </CardTitle>
           <p className="text-gray-300 font-light">
             {success ? 'Thank you! Redirecting back to Map...' : 'Your issue has been resolved safely.'}
           </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-8 pb-8">
          <div className="aspect-square bg-white rounded-xl mx-auto w-48 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-2 border-4 border-black border-dashed opacity-20"></div>
            <span className="text-black font-bold font-sans">
              {success ? 'PAID ✅' : 'QR Code'}
            </span>
          </div>

          {success ? (
            <div className="text-emerald-400 font-bold text-sm animate-pulse">
              Transaction Approved & Logged!
            </div>
          ) : (
            <Button 
              size="lg" 
              className="w-full text-lg bg-white text-black hover:bg-neutral-200"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Confirming Transaction...' : 'Confirm Payment'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
