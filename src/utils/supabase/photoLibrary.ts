import { projectId, publicAnonKey } from '@/utils/supabase/info';

export interface LibraryPhoto {
  name: string;
  path: string;
  url: string;
  size: number;
  createdAt: string;
  isFolder: boolean;
}

export interface LibraryFolder {
  name: string;
  path: string;
  isFolder: true;
}

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-5130f7cd`;

// Upload a photo to the library
export async function uploadPhotoToLibrary(file: File, folder?: string): Promise<LibraryPhoto | null> {
  try {
    console.log('Uploading photo to library:', file.name, 'folder:', folder);
    
    const formData = new FormData();
    formData.append('image', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await fetch(`${API_BASE_URL}/photo-library/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to upload photo:', errorText);
      return null;
    }

    const data = await response.json();
    console.log('Photo uploaded successfully:', data);
    
    // Return the photo data
    return {
      name: data.name,
      path: data.path,
      url: data.url,
      size: file.size,
      createdAt: new Date().toISOString(),
      isFolder: false,
    };
  } catch (error) {
    console.error('Error uploading photo to library:', error);
    return null;
  }
}

// Get all photos from the library (with folder support)
export async function fetchPhotoLibrary(folder?: string): Promise<{ folders: LibraryFolder[], photos: LibraryPhoto[], currentFolder: string }> {
  try {
    console.log('Fetching photo library...', folder ? `folder: ${folder}` : 'root');
    
    const url = folder 
      ? `${API_BASE_URL}/photo-library?folder=${encodeURIComponent(folder)}`
      : `${API_BASE_URL}/photo-library`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch photo library:', errorText);
      return { folders: [], photos: [], currentFolder: '' };
    }

    const data = await response.json();
    
    // Filter out .folder files from photos (defensive filtering)
    const filteredPhotos = (data.photos || []).filter((photo: LibraryPhoto) => 
      photo && 
      photo.name && 
      !photo.name.includes('.folder') && 
      !photo.path.includes('.folder')
    );
    
    console.log(`Fetched ${data.folders?.length || 0} folders and ${filteredPhotos.length} photos (filtered ${(data.photos?.length || 0) - filteredPhotos.length} .folder files)`);
    return {
      folders: data.folders || [],
      photos: filteredPhotos,
      currentFolder: data.currentFolder || '',
    };
  } catch (error) {
    console.error('Error fetching photo library:', error);
    return { folders: [], photos: [], currentFolder: '' };
  }
}

// Delete a photo from the library
export async function deletePhotoFromLibrary(path: string): Promise<boolean> {
  try {
    console.log('Deleting photo from library:', path);
    
    const response = await fetch(`${API_BASE_URL}/photo-library/${encodeURIComponent(path)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to delete photo:', errorText);
      return false;
    }

    console.log('Photo deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting photo from library:', error);
    return false;
  }
}

// Create a new folder
export async function createFolder(folderName: string, parentFolder?: string): Promise<boolean> {
  try {
    console.log('Creating folder:', folderName, 'in:', parentFolder || 'root');
    
    const response = await fetch(`${API_BASE_URL}/photo-library/create-folder`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folderName, parentFolder }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create folder:', errorText);
      return false;
    }

    console.log('Folder created successfully');
    return true;
  } catch (error) {
    console.error('Error creating folder:', error);
    return false;
  }
}

// Move photo to different folder
export async function movePhoto(fromPath: string, toFolder: string): Promise<boolean> {
  try {
    console.log('Moving photo:', fromPath, 'to:', toFolder);
    
    const response = await fetch(`${API_BASE_URL}/photo-library/move`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fromPath, toFolder }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to move photo:', errorText);
      return false;
    }

    console.log('Photo moved successfully');
    return true;
  } catch (error) {
    console.error('Error moving photo:', error);
    return false;
  }
}
