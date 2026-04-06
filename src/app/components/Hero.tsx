import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const heroVideo = 'https://res.cloudinary.com/dve2ivuns/video/upload/v1772645588/download1-ezgif.com-gif-to-mp4-converter_xsmcud.mp4';
const logoImg = 'https://res.cloudinary.com/dve2ivuns/image/upload/v1772646121/logo_neaz9k.png';

interface HeroProps {
  onNavigate: (page: 'home' | 'about' | 'shop' | 'admin') => void;
  currentPage: string;
}

export function Hero({ onNavigate, currentPage }: HeroProps) {
  const isHome = currentPage === 'home';

  return (
    <div className={`relative w-full ${isHome ? 'h-screen' : 'h-auto'}`}>
      {/* Hero Video - Only show on home page */}
      {isHome && (
        <>
          <div className="absolute inset-0">
            <video
              src={heroVideo}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        </>
      )}

      {/* Navigation */}
      <nav className={`relative z-10 flex items-center justify-between px-8 py-6 ${!isHome ? 'bg-[#0A0A0A]' : ''}`}>
        {/* Logo */}
        <motion.button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <motion.div
            className="w-12 h-12"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <img src={logoImg} alt="Marling Motorcycles Logo" className="w-full h-full object-contain" />
          </motion.div>
          <span className="text-white font-['Roboto_Mono'] text-2xl">Marling Motorcycles</span>
        </motion.button>

        {/* Navigation Tabs */}
        <div className="flex gap-8 items-center">
          <motion.button
            onClick={() => onNavigate('shop')}
            className={`text-white hover:text-[#FFC700] transition-colors font-['Roboto_Mono'] text-2xl ${
              currentPage === 'shop' ? 'underline decoration-[#FFC700]' : ''
            }`}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Shop
          </motion.button>
          <motion.button
            onClick={() => onNavigate('about')}
            className={`text-white hover:text-[#FFC700] transition-colors font-['Roboto_Mono'] text-2xl ${
              currentPage === 'about' ? 'underline decoration-[#FFC700]' : ''
            }`}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            About
          </motion.button>
        </div>
      </nav>

      {/* Hero Content - Only show on home page */}
      {isHome && (
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between ml-8 mr-8 mb-12">
          <motion.div 
            className="flex flex-col items-start gap-2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1 
              className="text-black text-6xl text-left bg-white px-6 py-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Custom Bikes
            </motion.h1>
            <motion.h1 
              className="text-black text-6xl text-left bg-white px-6 py-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Built to Ride.
            </motion.h1>
          </motion.div>
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowRight className="text-black" size={48} />
          </motion.div>
        </div>
      )}
    </div>
  );
}