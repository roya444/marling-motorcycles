import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Trash2, Check, Image as ImageIcon, Folder, FolderPlus, Home, ChevronRight, FolderOpen, Move, CheckSquare, Square, XCircle } from 'lucide-react';
import { fetchPhotoLibrary, uploadPhotoToLibrary, deletePhotoFromLibrary, createFolder, movePhoto, type LibraryPhoto, type LibraryFolder } from '@/utils/supabase/photoLibrary';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

interface PhotoLibraryProps {
  onSelectPhoto: (url: string, storagePath: string) => void;
  currentImageUrl?: string;
  onClose: () => void;
}

export function PhotoLibrary({ onSelectPhoto, currentImageUrl, onClose }: PhotoLibraryProps) {
  const [folders, setFolders] = useState<LibraryFolder[]>([]);
  const [photos, setPhotos] = useState<LibraryPhoto[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<LibraryPhoto | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Bulk selection states
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [allFolders, setAllFolders] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newFolderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPhotos();
    loadAllFolders();
  }, [currentFolder]);

  useEffect(() => {
    if (showNewFolderInput && newFolderInputRef.current) {
      newFolderInputRef.current.focus();
    }
  }, [showNewFolderInput]);

  async function loadPhotos() {
    setLoading(true);
    const data = await fetchPhotoLibrary(currentFolder);
    setFolders(data.folders);
    setPhotos(data.photos);
    setLoading(false);
  }

  async function loadAllFolders() {
    // Recursively load all folders for the move dialog
    const allFolderPaths: string[] = [''];  // Start with root
    
    async function exploreFolders(path: string) {
      const data = await fetchPhotoLibrary(path);
      for (const folder of data.folders) {
        allFolderPaths.push(folder.path);
        await exploreFolders(folder.path);
      }
    }
    
    await exploreFolders('');
    setAllFolders(allFolderPaths);
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedPhotos: LibraryPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      toast.loading(`Uploading ${file.name}...`, { id: `upload-${i}` });
      
      const photo = await uploadPhotoToLibrary(file, currentFolder);
      
      if (photo) {
        uploadedPhotos.push(photo);
        toast.success(`${file.name} uploaded!`, { id: `upload-${i}` });
      } else {
        toast.error(`Failed to upload ${file.name}`, { id: `upload-${i}` });
      }
    }

    if (uploadedPhotos.length > 0) {
      await loadPhotos();
      toast.success(`Successfully uploaded ${uploadedPhotos.length} photo(s)!`);
    }

    setUploading(false);
  }

  async function handleDeletePhoto(path: string, name: string) {
    if (!confirm(`Delete "${name}" from library?`)) return;

    const success = await deletePhotoFromLibrary(path);
    
    if (success) {
      toast.success('Photo deleted from library');
      await loadPhotos();
      
      // If deleted photo was selected, clear selection
      if (selectedPhoto?.path === path) {
        setSelectedPhoto(null);
      }
      
      // Remove from bulk selection if present
      if (selectedPhotos.has(path)) {
        const newSelected = new Set(selectedPhotos);
        newSelected.delete(path);
        setSelectedPhotos(newSelected);
      }
    } else {
      toast.error('Failed to delete photo');
    }
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    const success = await createFolder(newFolderName, currentFolder);
    
    if (success) {
      toast.success(`Folder "${newFolderName}" created!`);
      setNewFolderName('');
      setShowNewFolderInput(false);
      await loadPhotos();
      await loadAllFolders();
    } else {
      toast.error('Failed to create folder');
    }
  }

  async function handleMovePhotos(targetFolder: string) {
    const photosToMove = Array.from(selectedPhotos);
    
    if (photosToMove.length === 0) {
      toast.error('No photos selected');
      return;
    }

    toast.loading(`Moving ${photosToMove.length} photo(s)...`, { id: 'move-photos' });
    
    let successCount = 0;
    let failCount = 0;

    for (const photoPath of photosToMove) {
      const success = await movePhoto(photoPath, targetFolder);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Moved ${successCount} photo(s)!`, { id: 'move-photos' });
      await loadPhotos();
      await loadAllFolders();
      setSelectedPhotos(new Set());
      setShowMoveDialog(false);
      setSelectionMode(false);
    } else {
      toast.error(`Failed to move ${failCount} photo(s)`, { id: 'move-photos' });
    }
  }

  function handleSelectPhoto() {
    if (selectedPhoto) {
      onSelectPhoto(selectedPhoto.url, selectedPhoto.path);
      toast.success('Photo selected!');
      onClose();
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  }

  function navigateToFolder(folderPath: string) {
    setCurrentFolder(folderPath);
    setSelectedPhotos(new Set()); // Clear selection when navigating
  }

  function navigateUp() {
    if (!currentFolder) return;
    const parts = currentFolder.split('/');
    parts.pop();
    setCurrentFolder(parts.join('/'));
    setSelectedPhotos(new Set());
  }

  function getBreadcrumbs() {
    if (!currentFolder) return [];
    return currentFolder.split('/');
  }

  function togglePhotoSelection(photoPath: string) {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoPath)) {
      newSelected.delete(photoPath);
    } else {
      newSelected.add(photoPath);
    }
    setSelectedPhotos(newSelected);
  }

  function toggleSelectAll() {
    if (selectedPhotos.size === photos.length && photos.length > 0) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map(p => p.path)));
    }
  }

  function cancelSelectionMode() {
    setSelectionMode(false);
    setSelectedPhotos(new Set());
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#08090B] text-white p-6 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-2xl font-['Roboto_Mono'] mb-1">Photo Library</h2>
            <p className="text-gray-400">
              {selectionMode 
                ? `${selectedPhotos.size} photo(s) selected` 
                : 'Upload and manage your motorcycle photos'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setCurrentFolder('')}
            className="flex items-center gap-1 px-3 py-1.5 rounded hover:bg-gray-200 transition-colors text-sm"
          >
            <Home size={16} />
            <span>Library</span>
          </button>
          
          {getBreadcrumbs().map((folder, index) => {
            const pathToFolder = getBreadcrumbs().slice(0, index + 1).join('/');
            return (
              <div key={index} className="flex items-center gap-2">
                <ChevronRight size={16} className="text-gray-400" />
                <button
                  onClick={() => navigateToFolder(pathToFolder)}
                  className="px-3 py-1.5 rounded hover:bg-gray-200 transition-colors text-sm"
                >
                  {folder}
                </button>
              </div>
            );
          })}
        </div>

        {/* Upload Area */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? 'border-[#FFC700] bg-[#FFC700]/10'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload size={40} className="mx-auto mb-3 text-gray-400" />
            <p className="text-base mb-2">
              Drag & drop photos here, or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[#FFC700] hover:text-[#FFD700] font-bold underline"
                disabled={uploading}
              >
                browse
              </button>
            </p>
            <p className="text-sm text-gray-500 mb-3">
              {currentFolder ? `Uploading to: ${currentFolder}` : 'Uploading to root folder'}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
              disabled={uploading}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#FFC700] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <>
              {/* Folder & Selection Actions */}
              <div className="mb-6 flex gap-2 flex-wrap items-center">
                {!selectionMode ? (
                  <>
                    {!showNewFolderInput ? (
                      <>
                        <motion.button
                          onClick={() => setShowNewFolderInput(true)}
                          className="px-4 py-2 bg-[#666666] text-white rounded-lg hover:bg-[#999999] transition-colors flex items-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <FolderPlus size={18} />
                          New Folder
                        </motion.button>
                        
                        {photos.length > 0 && (
                          <motion.button
                            onClick={() => setSelectionMode(true)}
                            className="px-4 py-2 bg-[#FFC700] text-[#0A0A0A] font-bold rounded-lg hover:bg-[#FFD700] transition-colors flex items-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <CheckSquare size={18} />
                            Select Photos
                          </motion.button>
                        )}
                      </>
                    ) : (
                      <div className="flex gap-2 flex-1">
                        <input
                          ref={newFolderInputRef}
                          type="text"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateFolder();
                            if (e.key === 'Escape') {
                              setShowNewFolderInput(false);
                              setNewFolderName('');
                            }
                          }}
                          placeholder="Folder name (e.g., Sport Bikes)"
                          className="flex-1 px-4 py-2 border-2 border-[#FFC700] rounded-lg focus:outline-none"
                        />
                        <motion.button
                          onClick={handleCreateFolder}
                          className="px-4 py-2 bg-[#FFC700] text-[#0A0A0A] font-bold rounded-lg hover:bg-[#FFD700]"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Create
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            setShowNewFolderInput(false);
                            setNewFolderName('');
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Cancel
                        </motion.button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex gap-2 flex-1 items-center">
                    <motion.button
                      onClick={toggleSelectAll}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {selectedPhotos.size === photos.length && photos.length > 0 ? (
                        <>
                          <Square size={18} />
                          Deselect All
                        </>
                      ) : (
                        <>
                          <CheckSquare size={18} />
                          Select All
                        </>
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setShowMoveDialog(true)}
                      disabled={selectedPhotos.size === 0}
                      className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 ${
                        selectedPhotos.size > 0
                          ? 'bg-[#FFC700] text-[#0A0A0A] hover:bg-[#FFD700]'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      whileHover={selectedPhotos.size > 0 ? { scale: 1.02 } : {}}
                      whileTap={selectedPhotos.size > 0 ? { scale: 0.98 } : {}}
                    >
                      <Move size={18} />
                      Move to Folder
                    </motion.button>
                    
                    <motion.button
                      onClick={cancelSelectionMode}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <XCircle size={18} />
                      Cancel
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Folders Grid */}
              {folders.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wide">Folders</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {folders.map((folder) => (
                      <motion.button
                        key={folder.path}
                        onClick={() => navigateToFolder(folder.path)}
                        className="p-4 bg-gray-100 hover:bg-gray-200 rounded-lg flex flex-col items-center gap-2 transition-colors group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FolderOpen size={48} className="text-[#FFC700] group-hover:text-[#FFD700]" />
                        <span className="text-sm font-medium text-center line-clamp-2">{folder.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos Grid */}
              {photos.length === 0 && folders.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon size={64} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-xl text-gray-600 mb-2">No photos yet</p>
                  <p className="text-gray-500">Upload your first photo to get started!</p>
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon size={64} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">No photos in this folder</p>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wide">Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                      <motion.div
                        key={photo.path}
                        className={`relative group aspect-square rounded-lg overflow-hidden cursor-pointer border-4 transition-all ${
                          selectionMode
                            ? selectedPhotos.has(photo.path)
                              ? 'border-[#FFC700] shadow-lg'
                              : 'border-gray-300'
                            : selectedPhoto?.path === photo.path
                            ? 'border-[#FFC700] shadow-lg'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                        onClick={() => {
                          if (selectionMode) {
                            togglePhotoSelection(photo.path);
                          } else {
                            setSelectedPhoto(photo);
                          }
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <ImageWithFallback
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Selection Checkbox */}
                        {selectionMode && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`absolute top-2 right-2 rounded-lg p-1.5 ${
                              selectedPhotos.has(photo.path)
                                ? 'bg-[#FFC700] text-[#0A0A0A]'
                                : 'bg-white/90 text-gray-600'
                            }`}
                          >
                            {selectedPhotos.has(photo.path) ? (
                              <CheckSquare size={20} />
                            ) : (
                              <Square size={20} />
                            )}
                          </motion.div>
                        )}
                        
                        {/* Selection Indicator (non-selection mode) */}
                        {!selectionMode && selectedPhoto === photo.url && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 bg-[#FFC700] text-[#0A0A0A] rounded-full p-1"
                          >
                            <Check size={20} />
                          </motion.div>
                        )}

                        {/* Delete Button */}
                        {!selectionMode && (
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePhoto(photo.path, photo.name);
                            }}
                            className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        )}

                        {/* Photo Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-sm truncate">{photo.name}</p>
                          <p className="text-gray-300 text-xs">
                            {(photo.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center bg-gray-50 flex-shrink-0">
          <p className="text-sm text-gray-600">
            {folders.length} folder{folders.length !== 1 ? 's' : ''} • {photos.length} photo{photos.length !== 1 ? 's' : ''}
            {!selectionMode && selectedPhoto && ' • 1 selected'}
            {selectionMode && selectedPhotos.size > 0 && ` • ${selectedPhotos.size} selected`}
          </p>
          <div className="flex gap-3">
            <motion.button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            {!selectionMode && (
              <motion.button
                onClick={handleSelectPhoto}
                disabled={!selectedPhoto}
                className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                  selectedPhoto
                    ? 'bg-[#FFC700] text-[#0A0A0A] hover:bg-[#FFD700]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                whileHover={selectedPhoto ? { scale: 1.05 } : {}}
                whileTap={selectedPhoto ? { scale: 0.95 } : {}}
              >
                Select Photo
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Move to Folder Dialog */}
      <AnimatePresence>
        {showMoveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowMoveDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-['Roboto_Mono'] mb-4">Move {selectedPhotos.size} Photo(s)</h3>
              <p className="text-gray-600 mb-4">Select destination folder:</p>
              
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg mb-6">
                {allFolders.map((folderPath) => (
                  <button
                    key={folderPath || 'root'}
                    onClick={() => handleMovePhotos(folderPath)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                  >
                    {folderPath === '' ? (
                      <>
                        <Home size={18} className="text-[#FFC700]" />
                        <span className="font-medium">Root Library</span>
                      </>
                    ) : (
                      <>
                        <Folder size={18} className="text-[#FFC700]" />
                        <span>{folderPath}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
              
              <motion.button
                onClick={() => setShowMoveDialog(false)}
                className="w-full px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
