import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { fetchPhotoLibrary, type LibraryPhoto } from '@/utils/supabase/photoLibrary';

export function Workshop() {
  const [photos, setPhotos] = useState<LibraryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<LibraryPhoto | null>(null);

  useEffect(() => {
    loadWorkshopPhotos();
  }, []);

  async function loadWorkshopPhotos() {
    setLoading(true);
    const data = await fetchPhotoLibrary('In the workshop');
    setPhotos(data.photos);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-[#08090B] mb-4">Loading workshop photos...</div>
          <div className="w-16 h-16 border-4 border-[#FFC700] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-8 sm:py-20">
        <h1 className="text-2xl sm:text-[32px] font-['Roboto_Mono'] font-medium mb-4 text-[#0A0A0A]">In the Workshop</h1>
        <p className="font-['Inter'] text-lg text-[rgba(8,9,11,0.8)] mb-12 max-w-[756px]">
          A look at what we're currently working on — bikes being stripped down, rebuilt, and brought back to life.
        </p>

        {photos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">Nothing in the workshop right now. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.path}
                className="rounded-[10px] overflow-hidden shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    <ImageWithFallback
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 sm:p-8 cursor-pointer"
          onClick={() => setSelectedPhoto(null)}
        >
          <motion.img
            src={selectedPhoto.url}
            alt={selectedPhoto.name}
            className="max-w-full max-h-full object-contain rounded-lg"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      )}
    </div>
  );
}
