import { projectId, publicAnonKey } from '@/utils/supabase/info';

export interface Motorcycle {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  gallery?: string[]; // Additional images for the gallery
  description?: string;
  specs?: string[];
  imageStoragePath?: string;
  isDaytonaSeries?: boolean;
  isForSale?: boolean;
}

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-5130f7cd`;

// Log API configuration on load
console.log('Supabase Configuration:', {
  projectId,
  API_BASE_URL,
  publicAnonKeyPresent: !!publicAnonKey,
  publicAnonKeyLength: publicAnonKey?.length
});

// Test API connectivity
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Testing connection to:', `${API_BASE_URL}/health`);
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      return { 
        success: false, 
        message: `Server returned ${response.status}: ${response.statusText}` 
      };
    }

    const data = await response.json();
    return { 
      success: true, 
      message: `Connected! Server status: ${data.status}` 
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Connection failed: ${(error as Error).message}` 
    };
  }
}

// Fix motorcycle image paths (migration utility)
export async function fixMotorcyclePaths(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Fixing motorcycle image paths...');
    const response = await fetch(`${API_BASE_URL}/fix-motorcycle-paths`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Failed to fix paths: ${response.statusText}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || 'Paths fixed successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: `Error: ${(error as Error).message}`
    };
  }
}

// Fetch all motorcycles from the backend
export async function fetchMotorcycles(): Promise<Motorcycle[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/motorcycles`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch motorcycles:', errorText);
      return [];
    }

    const data = await response.json();
    const motorcycles = data.motorcycles || [];
    
    // Defensive filtering: Remove .folder files from gallery arrays on the frontend
    motorcycles.forEach((bike: Motorcycle) => {
      if (bike.gallery && Array.isArray(bike.gallery)) {
        bike.gallery = bike.gallery.filter(path => 
          path && 
          typeof path === 'string' && 
          !path.includes('.folder') &&
          !path.endsWith('/.folder')
        );
      }
    });
    
    return motorcycles;
  } catch (error) {
    console.error('Error fetching motorcycles:', error);
    return [];
  }
}

// Fetch a single motorcycle by ID
export async function fetchMotorcycleById(id: number): Promise<Motorcycle | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/motorcycles/${id}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const motorcycle = data.motorcycle || null;
    
    // Defensive filtering: Remove .folder files from gallery array on the frontend
    if (motorcycle && motorcycle.gallery && Array.isArray(motorcycle.gallery)) {
      motorcycle.gallery = motorcycle.gallery.filter((path: string) => 
        path && 
        typeof path === 'string' && 
        !path.includes('.folder') &&
        !path.endsWith('/.folder')
      );
    }
    
    return motorcycle;
  } catch (error) {
    console.error('Error fetching motorcycle:', error);
    return null;
  }
}

// Create or update a motorcycle
export async function saveMotorcycle(motorcycle: Motorcycle): Promise<boolean> {
  try {
    console.log('Saving motorcycle to:', `${API_BASE_URL}/motorcycles`);
    console.log('Motorcycle data:', motorcycle);
    
    // Defensive filtering: Clean up gallery array before saving
    const cleanedMotorcycle = { ...motorcycle };
    if (cleanedMotorcycle.gallery && Array.isArray(cleanedMotorcycle.gallery)) {
      cleanedMotorcycle.gallery = cleanedMotorcycle.gallery.filter(path => 
        path && 
        typeof path === 'string' && 
        !path.includes('.folder') &&
        !path.endsWith('/.folder')
      );
      console.log(`Filtered gallery: ${motorcycle.gallery.length} → ${cleanedMotorcycle.gallery.length} items`);
    }
    
    const response = await fetch(`${API_BASE_URL}/motorcycles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanedMotorcycle),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to save motorcycle - Response:', errorText);
      return false;
    }

    const data = await response.json();
    console.log('Save successful:', data);
    return true;
  } catch (error) {
    console.error('Error saving motorcycle (catch block):', error);
    console.error('Error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    return false;
  }
}

// Delete a motorcycle
export async function deleteMotorcycle(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/motorcycles/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting motorcycle:', error);
    return false;
  }
}

// Upload an image for a motorcycle
export async function uploadMotorcycleImage(id: number, file: File, isGallery: boolean = false): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('isGallery', String(isGallery));

    const response = await fetch(`${API_BASE_URL}/motorcycles/${id}/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to upload image:', errorText);
      return null;
    }

    const data = await response.json();
    return data.imageUrl || null;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}
