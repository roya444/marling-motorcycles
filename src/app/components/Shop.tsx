import React, { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';
import { fetchMotorcycles, type Motorcycle } from '@/utils/supabase/motorcycles';
import { seedMotorcycles } from '@/utils/supabase/seedMotorcycles';

interface ShopProps {
  onViewBike: (bike: Motorcycle) => void;
  onNavigateAdmin: () => void;
}

export function Shop({ onViewBike, onNavigateAdmin }: ShopProps) {
  const [showDaytonaSeries, setShowDaytonaSeries] = useState(false);
  const [showForSale, setShowForSale] = useState(false);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Fetch motorcycles from backend on component mount
  useEffect(() => {
    loadMotorcycles();
  }, []);

  async function loadMotorcycles() {
    setLoading(true);
    const bikes = await fetchMotorcycles();
    setMotorcycles(bikes);
    setLoading(false);
  }

  async function handleSeedDatabase() {
    setSeeding(true);
    await seedMotorcycles();
    await loadMotorcycles();
    setSeeding(false);
  }

  const filteredMotorcycles = motorcycles.filter(bike => {
    // If no filters are selected, show all motorcycles
    if (!showDaytonaSeries && !showForSale) {
      return true;
    }
    
    // If both filters are selected, bike must match both
    if (showDaytonaSeries && showForSale) {
      return bike.isDaytonaSeries && bike.isForSale;
    }
    
    // If only one filter is selected, bike must match that one
    if (showDaytonaSeries) {
      return bike.isDaytonaSeries;
    }
    
    if (showForSale) {
      return bike.isForSale;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-[#08090B] mb-4">Loading motorcycles...</div>
          <div className="w-16 h-16 border-4 border-[#B14032] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl text-[#0A0A0A]">Our Collection</h1>
          
          <div className="flex gap-3">
            {motorcycles.length === 0 && (
              <motion.button
                onClick={handleSeedDatabase}
                disabled={seeding}
                className={`px-6 py-3 rounded-lg text-[#0A0A0A] font-bold transition-colors ${
                  seeding
                    ? 'bg-[#E5E5E5] cursor-not-allowed'
                    : 'bg-[#FFC700] hover:bg-[#FFD700]'
                }`}
                whileHover={!seeding ? { scale: 1.05 } : {}}
                whileTap={!seeding ? { scale: 0.95 } : {}}
              >
                {seeding ? 'Initializing Database...' : 'Initialize Database'}
              </motion.button>
            )}
          </div>
        </div>

        {/* Filter Options */}
        <div className="flex gap-4 mb-12 flex-wrap">
          <motion.label
            className={`flex items-center gap-3 px-6 py-2 rounded-full transition-colors border-2 cursor-pointer ${
              showDaytonaSeries
                ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                : 'bg-white text-[#0A0A0A] border-[#E5E5E5] hover:border-[#FFC700]'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <input
              type="checkbox"
              checked={showDaytonaSeries}
              onChange={(e) => setShowDaytonaSeries(e.target.checked)}
              className="w-4 h-4 rounded border-2 cursor-pointer"
            />
            <span>Daytona Series</span>
          </motion.label>
          <motion.label
            className={`flex items-center gap-3 px-6 py-2 rounded-full transition-colors border-2 cursor-pointer ${
              showForSale
                ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                : 'bg-white text-[#0A0A0A] border-[#E5E5E5] hover:border-[#FFC700]'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <input
              type="checkbox"
              checked={showForSale}
              onChange={(e) => setShowForSale(e.target.checked)}
              className="w-4 h-4 rounded border-2 cursor-pointer"
            />
            <span>For Sale</span>
          </motion.label>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMotorcycles.map((bike, index) => (
            <motion.div
              key={bike.id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="relative h-64 overflow-hidden">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <ImageWithFallback
                    src={bike.image}
                    alt={bike.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
              </div>
              <div className="p-4">
                <h3 className="text-xl mb-2 text-[#0A0A0A]">{bike.name}</h3>
                <p className="text-xl text-[#0A0A0A] font-bold">{bike.price}</p>
                <motion.button
                  className="mt-4 w-full py-2 bg-[#FFC700] text-[#0A0A0A] font-bold hover:bg-[#FFD700] transition-colors rounded"
                  onClick={() => onViewBike(bike)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Details
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMotorcycles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">No motorcycles found in this category.</p>
          </div>
        )}

        {/* Refresh Images and Admin Links at Bottom */}
        {motorcycles.length > 0 && (
          <div className="text-center mt-12 pt-8 border-t border-[#E5E5E5]">
            <div className="flex justify-center gap-6">
              <button
                onClick={onNavigateAdmin}
                className="text-[#0A0A0A] underline hover:text-[#B14032] transition-colors cursor-pointer"
              >
                Admin
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}