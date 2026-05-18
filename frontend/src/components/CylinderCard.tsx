import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, MessageSquare, Fuel } from 'lucide-react';

interface CylinderCardProps {
  ownerName: string;
  distance: string;
  availability: string;
  isVerified?: boolean;
}

export function CylinderCard({ ownerName, distance, availability, isVerified = true }: CylinderCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="liquid-glass border-white/5 hover:border-white/20 transition-all group">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
               <span className="text-white text-xs">{ownerName.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white flex items-center gap-1.5">
                {ownerName}
                {isVerified && (
                  <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-black" title="Verified Owner"></span>
                )}
              </p>
              <p className="text-[10px] text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {distance}
              </p>
            </div>
          </div>
          <Badge className="bg-green-500/10 text-green-400 border-green-500/20 font-light text-[10px]">
            {availability}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-4 p-3 bg-white/5 rounded-xl border border-white/5">
           <Fuel className="w-4 h-4 text-gray-400" />
           <p className="text-[11px] text-gray-300">Standard 14.2kg Double Cylinder</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link to="/chat" className="w-full">
            <Button variant="outline" size="sm" className="w-full gap-2 text-[11px] bg-transparent border-white/10">
              <MessageSquare className="w-3.5 h-3.5" /> Chat
            </Button>
          </Link>
          <Button 
            size="sm" 
            className="w-full text-[11px] bg-white text-black font-medium"
            onClick={() => navigate('/booking/standard-refill-request')}
          >
            Request
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
