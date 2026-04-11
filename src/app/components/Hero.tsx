import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Menu, X } from 'lucide-react';

const heroVideo = 'https://res.cloudinary.com/dve2ivuns/video/upload/v1772645588/download1-ezgif.com-gif-to-mp4-converter_xsmcud.mp4';
const logoImg = 'https://res.cloudinary.com/dve2ivuns/image/upload/v1772646121/logo_neaz9k.png';

interface HeroProps {
  onNavigate: (page: 'home' | 'about' | 'shop' | 'workshop' | 'admin') => void;
  currentPage: string;
}

export function Hero({ onNavigate, currentPage }: HeroProps) {
  const isHome = currentPage === 'home';
  const [menuOpen, setMenuOpen] = useState(false);

  function navigate(page: 'home' | 'about' | 'shop' | 'workshop' | 'admin') {
    setMenuOpen(false);
    onNavigate(page);
  }

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
      <nav className={`relative z-10 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6 ${!isHome ? 'bg-[#0A0A0A]' : ''}`}>
        {/* Logo */}
        <motion.button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <motion.div
            className="w-10 h-10 sm:w-12 sm:h-12"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <img src={logoImg} alt="Marling Motorcycles Logo" className="w-full h-full object-contain" />
          </motion.div>
          <span className="text-white font-['Roboto_Mono'] text-lg sm:text-2xl">Marling Motorcycles</span>
        </motion.button>

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:flex gap-8 items-center">
          <motion.button
            onClick={() => navigate('shop')}
            className={`text-white hover:text-[#FFC700] transition-colors font-['Roboto_Mono'] text-2xl ${
              currentPage === 'shop' ? 'underline decoration-[#FFC700]' : ''
            }`}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Shop
          </motion.button>
          <motion.button
            onClick={() => navigate('workshop')}
            className={`text-white hover:text-[#FFC700] transition-colors font-['Roboto_Mono'] text-2xl ${
              currentPage === 'workshop' ? 'underline decoration-[#FFC700]' : ''
            }`}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Workshop
          </motion.button>
          <motion.button
            onClick={() => navigate('about')}
            className={`text-white hover:text-[#FFC700] transition-colors font-['Roboto_Mono'] text-2xl ${
              currentPage === 'about' ? 'underline decoration-[#FFC700]' : ''
            }`}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            About
          </motion.button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white p-2"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-[72px] left-0 right-0 z-20 md:hidden ${isHome ? 'bg-black/80 backdrop-blur-sm' : 'bg-[#0A0A0A]'}`}
          >
            <div className="flex flex-col px-4 py-4 gap-4">
              <button
                onClick={() => navigate('shop')}
                className={`text-white text-left font-['Roboto_Mono'] text-xl py-2 ${
                  currentPage === 'shop' ? 'text-[#FFC700]' : ''
                }`}
              >
                Shop
              </button>
              <button
                onClick={() => navigate('workshop')}
                className={`text-white text-left font-['Roboto_Mono'] text-xl py-2 ${
                  currentPage === 'workshop' ? 'text-[#FFC700]' : ''
                }`}
              >
                Workshop
              </button>
              <button
                onClick={() => navigate('about')}
                className={`text-white text-left font-['Roboto_Mono'] text-xl py-2 ${
                  currentPage === 'about' ? 'text-[#FFC700]' : ''
                }`}
              >
                About
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Content - Only show on home page */}
      {isHome && (
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between mx-4 mb-6 sm:mx-8 sm:mb-12">
          <motion.div
            className="flex flex-col items-start gap-2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1
              className="text-black text-3xl sm:text-5xl md:text-6xl text-left bg-white px-4 py-1 sm:px-6 sm:py-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Custom Bikes
            </motion.h1>
            <motion.h1
              className="text-black text-3xl sm:text-5xl md:text-6xl text-left bg-white px-4 py-1 sm:px-6 sm:py-2"
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
            className="hidden sm:block"
          >
            <ArrowRight className="text-black" size={48} />
          </motion.div>
        </div>
      )}
    </div>
  );
}
