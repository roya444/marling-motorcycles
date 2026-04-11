import React, { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { type Motorcycle } from '@/utils/supabase/motorcycles';

interface BikeDetailProps {
  bike: Motorcycle;
  onBack: () => void;
}

export function BikeDetail({ bike, onBack }: BikeDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Combine main image with gallery images
  // Filter out .folder files and invalid paths as a safety net
  const validGalleryImages = (bike.gallery || []).filter(
    (img) => img && !img.includes('.folder') && !img.endsWith('.folder')
  );
  const allImages = [bike.image, ...validGalleryImages];

  return (
    <motion.div 
      className="min-h-screen bg-[#0A0A0A]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back Button */}
      <div className="pt-6 pl-4 pb-6 sm:pt-8 sm:pl-8 sm:pb-8">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-white hover:text-[#FFC700] transition-colors"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={24} />
          <span>Back to Shop</span>
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12 sm:px-8 sm:pb-16">
        {/* Bike Image */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ImageWithFallback
            src={allImages[selectedImage]}
            alt={bike.name}
            className="w-full h-[280px] sm:h-[400px] md:h-[500px] object-contain"
          />
        </motion.div>

        {/* Image Gallery Thumbnails */}
        {allImages.length > 1 && (
          <div className="flex gap-2 sm:gap-4 mb-8 sm:mb-12 justify-center flex-wrap">
            {allImages.map((img, index) => (
              <motion.button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-16 h-16 sm:w-24 sm:h-24 border-2 ${
                  selectedImage === index ? 'border-[#FFC700]' : 'border-white/20'
                } overflow-hidden`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ImageWithFallback
                  src={img}
                  alt={`${bike.name} view ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </motion.button>
            ))}
          </div>
        )}

        {/* Bike Info */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">{bike.name}</h1>
          <p className="text-2xl sm:text-3xl text-[#FFC700] mb-6">{bike.price}</p>
          {bike.description && (
            <p className="text-white/80 text-lg max-w-3xl mx-auto whitespace-pre-line">
              {bike.description}
            </p>
          )}
        </motion.div>

        {/* Specifications and Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Specifications */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Specifications</h2>
            <div className="space-y-4">
              {bike.specs && bike.specs.length > 0 ? (
                <>
                  {bike.specs.slice(0, 4).map((spec, index) => {
                    const [label, value] = spec.split(':');
                    return (
                      <div key={index} className="flex justify-between border-b border-white/20 pb-3">
                        <span className="text-white/60 uppercase tracking-wider text-sm">
                          {label.trim()}
                        </span>
                        <span className="text-white font-bold">
                          {value?.trim() || ''}
                        </span>
                      </div>
                    );
                  })}
                </>
              ) : (
                <>
                  <div className="flex justify-between border-b border-white/20 pb-3">
                    <span className="text-white/60 uppercase tracking-wider text-sm">Engine</span>
                    <span className="text-white font-bold">V-Twin 750cc</span>
                  </div>
                  <div className="flex justify-between border-b border-white/20 pb-3">
                    <span className="text-white/60 uppercase tracking-wider text-sm">Power</span>
                    <span className="text-white font-bold">85 HP</span>
                  </div>
                  <div className="flex justify-between border-b border-white/20 pb-3">
                    <span className="text-white/60 uppercase tracking-wider text-sm">Weight</span>
                    <span className="text-white font-bold">215 kg</span>
                  </div>
                  <div className="flex justify-between border-b border-white/20 pb-3">
                    <span className="text-white/60 uppercase tracking-wider text-sm">Top Speed</span>
                    <span className="text-white font-bold">180 km/h</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Features</h2>
            <ul className="space-y-3">
              {bike.specs && bike.specs.length > 4 ? (
                bike.specs.slice(4).map((spec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-3 text-[#FFC700]">•</span>
                    <span className="text-white/80">{spec}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start">
                    <span className="mr-3 text-[#FFC700]">•</span>
                    <span className="text-white/80">Premium suspension system</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-[#FFC700]">•</span>
                    <span className="text-white/80">Advanced traction control</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-[#FFC700]">•</span>
                    <span className="text-white/80">Quick-shift transmission</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-[#FFC700]">•</span>
                    <span className="text-white/80">Full LED lighting package</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-[#FFC700]">•</span>
                    <span className="text-white/80">Digital instrument cluster</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-[#FFC700]">•</span>
                    <span className="text-white/80">Premium paint finish</span>
                  </li>
                </>
              )}
            </ul>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
