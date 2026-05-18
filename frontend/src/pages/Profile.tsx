import { 
  VStack, 
  HStack, 
  Box, 
  Text, 
  Heading, 
  Badge as ChakraBadge, 
  Icon,
} from '@chakra-ui/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, MapPin, Fuel, ArrowLeft, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Profile() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <button 
            onClick={() => navigate('/consumer')}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <Button 
            variant="ghost" 
            className="text-gray-500 hover:text-white gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </header>

        <VStack gap={8} align="stretch">
          {/* User Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <HStack gap={6} p={6} className="liquid-glass border border-white/10 rounded-3xl">
              <Box 
                w="64px"
                h="64px"
                className="rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20 text-2xl font-light"
              >
                JK
              </Box>
              <VStack align="flex-start" gap={1}>
                <HStack gap={2}>
                  <Heading size="md" fontWeight="300" color="white">Jay Kshirsagar</Heading>
                  <Icon as={ShieldCheck} color="blue.400" w={5} h={5} />
                </HStack>
                <Text color="gray.500" fontSize="sm">Member since April 2026</Text>
                <ChakraBadge colorScheme="green" variant="subtle" rounded="full" px={3} py={0.5} mt={2}>
                  Verified Member
                </ChakraBadge>
              </VStack>
            </HStack>
          </motion.div>

          {/* Account Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="liquid-glass border-white/10 bg-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Identity Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div>
                   <Text fontSize="xs" color="gray.600" mb={1}>Aadhaar Number</Text>
                    <Text fontSize="sm" fontWeight="light">XXXX XXXX 8923 (Masked)</Text>
                </div>
                <Box h="1px" w="full" bg="whiteAlpha.100" />
                <div>
                   <Text fontSize="xs" color="gray.600" mb={1}>Default Location</Text>
                    <HStack gap={2}>
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <Text fontSize="sm" fontWeight="light">Andheri West, Mumbai</Text>
                    </HStack>
                </div>
              </CardContent>
            </Card>

            <Card className="liquid-glass border-white/10 bg-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Resource Sharing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" fontWeight="light" color="gray.400">
                    Public Visibility
                  </Text>
                  <Box className="w-10 h-6 bg-green-500/50 rounded-full relative border border-green-500/50">
                    <Box className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </Box>
                </HStack>
                <Box h="1px" w="full" bg="whiteAlpha.100" />
                <HStack justify="space-between">
                   <HStack>
                     <Fuel className="w-3.5 h-3.5 text-gray-400" />
                     <Text fontSize="sm" fontWeight="light">My Cylinder Count</Text>
                   </HStack>
                   <Text fontSize="sm" fontWeight="bold">02</Text>
                </HStack>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Options */}
          <VStack gap={3} align="stretch" pt={4}>
            {[
              { label: 'My Trust & Verification Settings', icon: ShieldCheck, to: '/trust/me' },
              { label: 'Update Availability', icon: Fuel, to: '/resources' },
              { label: 'Manage Locations / Map', icon: MapPin, to: '/consumer' }
            ].map((item, idx) => (
              <button 
                key={idx}
                onClick={() => navigate(item.to)}
                className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group"
              >
                <HStack gap={4}>
                  <Box className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5 text-gray-400" />
                  </Box>
                  <Text fontSize="sm" fontWeight="light">{item.label}</Text>
                </HStack>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
              </button>
            ))}
          </VStack>
        </VStack>
      </div>
    </div>
  );
}
