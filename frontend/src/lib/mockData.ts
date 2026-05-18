export type MarkerData = {
  id: string;
  type: 'user' | 'cylinder' | 'emergency' | 'mechanic';
  position: {
    lat: number;
    lng: number;
  };
  ownerName?: string;
  price?: string;
  stock?: number;
  img?: string;
};

export const indianNames = [
  "Aarav Sharma", "Aditi Patel", "Arjun Mehra", "Priya Iyer", "Kabir Singh",
  "Saanvi Malhotra", "Ishaan Gupta", "Ananya Reddy", "Rohan Verma", "Diya Joshi",
  "Vihaan Deshmukh", "Myra Kulkarni", "Reyansh Chawla", "Kyra Nair"
];

const generateMarketplaceData = (center: [number, number], count: number): MarkerData[] => {
  return Array.from({ length: count }).map((_, i) => {
    // Random stock/fill level from 10% to 100%
    const stockLevelPercent = Math.floor(Math.random() * 91) + 10;
    // Base rate is ₹15 per percentage point + ₹100 flat fee
    const dynamicPrice = (stockLevelPercent * 9) + 250; 

    return {
      id: `cyl-${i}`,
      type: 'cylinder',
      position: {
        lat: center[0] + (Math.random() - 0.5) * 0.02,
        lng: center[1] + (Math.random() - 0.5) * 0.02,
      },
      ownerName: indianNames[Math.floor(Math.random() * indianNames.length)],
      price: `₹${dynamicPrice}`,
      stock: stockLevelPercent, // In this context, stock is the fill percentage
      img: `https://m.media-amazon.com/images/I/51IDuv7GU-L._AC_UF1000,1000_QL80_.jpg`
    };
  });
};

export const getMarkers = (center: [number, number]): MarkerData[] => [
  ...generateMarketplaceData(center, 12),
  {
    id: 'em-1',
    type: 'emergency',
    position: {
      lat: center[0] + 0.005,
      lng: center[1] - 0.003,
    }
  },
  {
    id: 'mech-1',
    type: 'mechanic',
    position: {
      lat: center[0] - 0.004,
      lng: center[1] + 0.006,
    },
    ownerName: "Rajesh Kumar",
  }
];

export const mockMarkers: MarkerData[] = getMarkers([19.1075, 72.8258]);

export const mockMessages = [
  { id: '1', text: 'Namaste! Is the cylinder still available?', sender: 'user' },
  { id: '2', text: 'Yes, it is. I have 2 full cylinders ready for pickup.', sender: 'owner' },
  { id: '3', text: 'Great, I can come by in 20 minutes.', sender: 'user' },
];
