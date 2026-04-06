import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, LogOut, Save, X, Upload, Wifi, Image as ImageIcon } from 'lucide-react';
import { fetchMotorcycles, saveMotorcycle, deleteMotorcycle, uploadMotorcycleImage, testConnection, type Motorcycle } from '@/utils/supabase/motorcycles';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PhotoLibrary } from './PhotoLibrary';
import { toast, Toaster } from 'sonner';

interface AdminProps {
  onLogout: () => void;
}

export function Admin({ onLogout }: AdminProps) {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBike, setEditingBike] = useState<Motorcycle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false);
  const [photoLibraryMode, setPhotoLibraryMode] = useState<'main' | 'gallery'>('main');

  useEffect(() => {
    loadMotorcycles();
  }, []);

  async function loadMotorcycles() {
    setLoading(true);
    const bikes = await fetchMotorcycles();
    setMotorcycles(bikes);
    setLoading(false);
  }

  async function handleTestConnection() {
    const result = await testConnection();
    if (result.success) {
      toast.success('Connection Successful!', {
        description: result.message,
      });
    } else {
      toast.error('Connection Failed', {
        description: result.message,
      });
    }
  }

  function handleAddNew() {
    const newId = motorcycles.length > 0 ? Math.max(...motorcycles.map(m => m.id)) + 1 : 1;
    setEditingBike({
      id: newId,
      name: '',
      category: '',
      price: '$',
      image: '',
      description: '',
      specs: [],
    });
    setShowForm(true);
  }

  function handleEdit(bike: Motorcycle) {
    setEditingBike({ ...bike });
    setShowForm(true);
  }

  async function handleSave() {
    if (!editingBike) return;

    setSaving(true);
    
    try {
      console.log('Attempting to save motorcycle:', editingBike);
      const success = await saveMotorcycle(editingBike);
      
      if (success) {
        toast.success('Motorcycle saved successfully!', {
          description: `${editingBike.name} has been updated.`,
        });
        await loadMotorcycles();
        setShowForm(false);
        setEditingBike(null);
      } else {
        toast.error('Failed to save motorcycle', {
          description: 'Check the console (F12) for detailed error information.',
        });
      }
    } catch (error) {
      console.error('Unexpected error in handleSave:', error);
      toast.error('Unexpected error saving motorcycle', {
        description: 'Check the console (F12) for details.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const bike = motorcycles.find(m => m.id === id);
    if (!confirm(`Are you sure you want to delete ${bike?.name || 'this motorcycle'}?`)) return;

    const success = await deleteMotorcycle(id);
    if (success) {
      toast.success('Motorcycle deleted', {
        description: `${bike?.name} has been removed from your inventory.`,
      });
      await loadMotorcycles();
    } else {
      toast.error('Failed to delete motorcycle', {
        description: 'Please try again.',
      });
    }
  }

  async function handleImageUpload(file: File) {
    if (!editingBike) return;

    setSaving(true);
    toast.loading('Uploading image...', { id: 'upload' });
    
    const success = await uploadMotorcycleImage(editingBike.id, file);
    
    if (success) {
      toast.success('Image uploaded successfully!', { id: 'upload' });
      // Reload to get the new image URL
      await loadMotorcycles();
      const updatedBike = motorcycles.find(m => m.id === editingBike.id);
      if (updatedBike) {
        setEditingBike(updatedBike);
      }
    } else {
      toast.error('Failed to upload image', { 
        id: 'upload',
        description: 'Please try again or use an image URL instead.',
      });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-[#08090B] mb-4">Loading admin panel...</div>
          <div className="w-16 h-16 border-4 border-[#B14032] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />
      {/* Header */}
      <div className="bg-[#08090B] text-white py-6 px-8 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-['Roboto_Mono']">Admin Panel</h1>
            <p className="text-gray-400 mt-1">Manage your motorcycle inventory</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              onClick={handleTestConnection}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white hover:bg-gray-600 transition-colors rounded"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Test backend connection"
            >
              <Wifi size={18} />
              Test Connection
            </motion.button>
            <motion.button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-[#FFC700] text-[#0A0A0A] font-bold hover:bg-[#FFD700] transition-colors rounded"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={18} />
              Logout
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Add New Button */}
        <div className="mb-8">
          <motion.button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-3 bg-[#FFC700] text-[#0A0A0A] font-bold rounded-lg hover:bg-[#FFD700] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            Add New Motorcycle
          </motion.button>
        </div>

        {/* Motorcycles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {motorcycles.map((bike) => (
            <motion.div
              key={bike.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
            >
              <div className="relative h-48 bg-gray-200">
                <ImageWithFallback
                  src={bike.image}
                  alt={bike.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-[#08090B] mb-1">{bike.name}</h3>
                <p className="text-xl text-[#CF9834] mb-4">{bike.price}</p>
                
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => handleEdit(bike)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0A0A0A] text-white rounded hover:bg-[#1A1A1A] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit2 size={16} />
                    Edit
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(bike.id)}
                    className="px-4 py-2 bg-[#666666] text-white rounded hover:bg-[#999999] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {motorcycles.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg">
            <p className="text-xl text-gray-600 mb-4">No motorcycles yet</p>
            <p className="text-gray-500">Click "Add New Motorcycle" to get started</p>
          </div>
        )}
      </div>

      {/* Edit/Add Form Modal */}
      <AnimatePresence>
        {showForm && editingBike && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-3xl my-8"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              {/* Form Header */}
              <div className="bg-[#08090B] text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
                <h2 className="text-2xl font-['Roboto_Mono']">
                  {editingBike.name ? `Edit ${editingBike.name}` : 'Add New Motorcycle'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingBike(null);
                  }}
                  className="text-white hover:text-[#CF9834] transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-bold text-[#08090B] mb-2">
                      Motorcycle Name *
                    </label>
                    <input
                      type="text"
                      value={editingBike.name}
                      onChange={(e) => setEditingBike({ ...editingBike, name: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-[#B14032] focus:outline-none"
                      placeholder="e.g., Airborne"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-bold text-[#08090B] mb-2">
                      Price *
                    </label>
                    <input
                      type="text"
                      value={editingBike.price}
                      onChange={(e) => setEditingBike({ ...editingBike, price: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-[#B14032] focus:outline-none"
                      placeholder="e.g., $12,500"
                    />
                  </div>

                  {/* Main Image */}
                  <div>
                    <label className="block text-sm font-bold text-[#08090B] mb-2">
                      Main Image
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingBike.image}
                        onChange={(e) => setEditingBike({ ...editingBike, image: e.target.value })}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded focus:border-[#B14032] focus:outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                      <motion.button
                        onClick={() => {
                          setPhotoLibraryMode('main');
                          setShowPhotoLibrary(true);
                        }}
                        className="px-4 py-2 bg-[#FFC700] text-[#0A0A0A] font-bold rounded hover:bg-[#FFD700] transition-colors flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ImageIcon size={18} />
                        Library
                      </motion.button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      💡 Tip: Click "Library" to upload & manage all your photos in one place!
                    </p>
                  </div>

                  {/* Image Preview */}
                  {editingBike.image && (
                    <div>
                      <label className="block text-sm font-bold text-[#08090B] mb-2">
                        Main Image Preview
                      </label>
                      <div className="w-full h-48 bg-gray-100 rounded overflow-hidden">
                        <ImageWithFallback
                          src={editingBike.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Gallery Images */}
                  <div>
                    <label className="block text-sm font-bold text-[#08090B] mb-2">
                      Gallery Images (Additional Photos)
                    </label>
                    
                    {/* Gallery URLs */}
                    <div className="space-y-2 mb-3">
                      {(editingBike.gallery || []).map((imgUrl, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={imgUrl}
                            onChange={(e) => {
                              const newGallery = [...(editingBike.gallery || [])];
                              newGallery[index] = e.target.value;
                              setEditingBike({ ...editingBike, gallery: newGallery });
                            }}
                            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded focus:border-[#FFC700] focus:outline-none"
                            placeholder="https://example.com/gallery-image.jpg"
                          />
                          <button
                            onClick={() => {
                              const newGallery = (editingBike.gallery || []).filter((_, i) => i !== index);
                              setEditingBike({ ...editingBike, gallery: newGallery });
                            }}
                            className="px-3 py-2 bg-[#666666] text-white rounded hover:bg-[#999999]"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const newGallery = [...(editingBike.gallery || []), ''];
                            setEditingBike({ ...editingBike, gallery: newGallery });
                          }}
                          className="flex-1 px-4 py-2 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:border-[#FFC700] hover:text-[#0A0A0A] transition-colors"
                        >
                          + Add Gallery Image URL
                        </button>
                        <motion.button
                          onClick={() => {
                            setPhotoLibraryMode('gallery');
                            setShowPhotoLibrary(true);
                          }}
                          className="px-4 py-2 bg-[#FFC700] text-[#0A0A0A] font-bold rounded hover:bg-[#FFD700] transition-colors flex items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ImageIcon size={18} />
                          From Library
                        </motion.button>
                      </div>
                    </div>

                    {/* Gallery Preview */}
                    {editingBike.gallery && editingBike.gallery.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {editingBike.gallery
                          .filter(imgUrl => imgUrl && !imgUrl.includes('.folder') && !imgUrl.endsWith('.folder'))
                          .map((imgUrl, index) => (
                            <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                              <ImageWithFallback
                                src={imgUrl}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-[#08090B] mb-2">
                      Description
                    </label>
                    <textarea
                      value={editingBike.description || ''}
                      onChange={(e) => setEditingBike({ ...editingBike, description: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-[#B14032] focus:outline-none h-32 resize-none"
                      placeholder="Enter a detailed description..."
                    />
                  </div>

                  {/* Specifications */}
                  <div>
                    <label className="block text-sm font-bold text-[#08090B] mb-2">
                      Specifications
                    </label>
                    <div className="space-y-2">
                      {(editingBike.specs || []).map((spec, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={spec}
                            onChange={(e) => {
                              const newSpecs = [...(editingBike.specs || [])];
                              newSpecs[index] = e.target.value;
                              setEditingBike({ ...editingBike, specs: newSpecs });
                            }}
                            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded focus:border-[#B14032] focus:outline-none"
                            placeholder="e.g., Engine: 600cc Inline-4"
                          />
                          <button
                            onClick={() => {
                              const newSpecs = (editingBike.specs || []).filter((_, i) => i !== index);
                              setEditingBike({ ...editingBike, specs: newSpecs });
                            }}
                            className="px-3 py-2 bg-[#666666] text-white rounded hover:bg-[#999999]"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newSpecs = [...(editingBike.specs || []), ''];
                          setEditingBike({ ...editingBike, specs: newSpecs });
                        }}
                        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:border-[#B14032] hover:text-[#B14032] transition-colors"
                      >
                        + Add Specification
                      </button>
                    </div>
                  </div>

                  {/* Filter Tags */}
                  <div>
                    <label className="block text-sm font-bold text-[#08090B] mb-2">
                      Filter Tags
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingBike.isDaytonaSeries || false}
                          onChange={(e) => setEditingBike({ ...editingBike, isDaytonaSeries: e.target.checked })}
                          className="w-5 h-5 rounded border-2 border-gray-300 cursor-pointer"
                        />
                        <span className="text-[#08090B]">Daytona Series</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingBike.isForSale || false}
                          onChange={(e) => setEditingBike({ ...editingBike, isForSale: e.target.checked })}
                          className="w-5 h-5 rounded border-2 border-gray-300 cursor-pointer"
                        />
                        <span className="text-[#08090B]">For Sale</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                <motion.button
                  onClick={() => {
                    setShowForm(false);
                    setEditingBike(null);
                  }}
                  className="px-6 py-2 border-2 border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  disabled={saving || !editingBike.name || !editingBike.price}
                  className={`flex items-center gap-2 px-6 py-2 rounded text-white transition-colors ${
                    saving || !editingBike.name || !editingBike.price
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#FFC700] hover:bg-[#FFD700] text-[#0A0A0A] font-bold'
                  }`}
                  whileHover={!saving ? { scale: 1.05 } : {}}
                  whileTap={!saving ? { scale: 0.95 } : {}}
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Motorcycle'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Library Modal */}
      <AnimatePresence>
        {showPhotoLibrary && editingBike && (
          <PhotoLibrary
            currentImageUrl={photoLibraryMode === 'main' ? editingBike.image : ''}
            onSelectPhoto={(url, storagePath) => {
              if (photoLibraryMode === 'main') {
                setEditingBike({ ...editingBike, image: url, imageStoragePath: storagePath });
              } else {
                // Add to gallery - use storage path instead of signed URL
                const newGallery = [...(editingBike.gallery || []), storagePath || url];
                setEditingBike({ ...editingBike, gallery: newGallery });
              }
            }}
            onClose={() => setShowPhotoLibrary(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
