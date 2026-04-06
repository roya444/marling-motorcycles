import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize storage bucket on startup
const BUCKET_NAME = 'make-5130f7cd-motorcycles';

// Signed URL cache to avoid regenerating on every request
// Cache entries expire after 20 hours (URLs are valid for 24 hours)
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();
const CACHE_TTL_MS = 20 * 60 * 60 * 1000; // 20 hours

async function getCachedSignedUrl(bucket: string, path: string): Promise<string | null> {
  const cacheKey = `${bucket}:${path}`;
  const cached = signedUrlCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600 * 24); // 24 hour expiry

  if (error || !data?.signedUrl) {
    console.log(`Error creating signed URL for ${bucket}/${path}: ${error}`);
    return null;
  }

  signedUrlCache.set(cacheKey, {
    url: data.signedUrl,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return data.signedUrl;
}

async function initializeStorage() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      });
      console.log(`Created storage bucket: ${BUCKET_NAME}`);
    } else {
      console.log(`Storage bucket already exists: ${BUCKET_NAME}`);
    }
  } catch (error) {
    console.log(`Error initializing storage: ${error}`);
  }
}

// Initialize storage buckets on startup
Promise.all([
  initializeStorage(),
  initializePhotoLibrary()
]).then(() => {
  console.log('All storage buckets initialized successfully');
}).catch((error) => {
  console.log(`Error during initialization: ${error}`);
});

// Health check endpoint
app.get("/make-server-5130f7cd/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all motorcycles
app.get("/make-server-5130f7cd/motorcycles", async (c) => {
  try {
    console.log('Fetching all motorcycles from KV store');
    const motorcycles = await kv.getByPrefix('motorcycle:');
    
    // Process each motorcycle to get signed URLs for images
    const processedMotorcycles = await Promise.all(
      motorcycles.map(async (bike) => {
        const processedBike = { ...bike };
        
        // Process main image
        if (bike.imageStoragePath) {
          const isPhotoLibrary = bike.imageStoragePath.includes('/');
          const bucket = isPhotoLibrary ? LIBRARY_BUCKET_NAME : BUCKET_NAME;
          const url = await getCachedSignedUrl(bucket, bike.imageStoragePath);
          if (url) processedBike.image = url;
        }

        // Process gallery images
        if (bike.gallery && Array.isArray(bike.gallery) && bike.gallery.length > 0) {
          const validGalleryPaths = bike.gallery.filter((path: string) =>
            path && !path.includes('.folder') && !path.endsWith('/.folder')
          );

          const galleryUrls = await Promise.all(
            validGalleryPaths.map(async (path: string) => {
              if (path.startsWith('http')) return path;
              const isPhotoLibrary = path.includes('/');
              const bucket = isPhotoLibrary ? LIBRARY_BUCKET_NAME : BUCKET_NAME;
              return await getCachedSignedUrl(bucket, path);
            })
          );

          processedBike.gallery = galleryUrls.filter(url => url && typeof url === 'string');
        }
        
        return processedBike;
      })
    );
    
    console.log(`Successfully fetched ${processedMotorcycles.length} motorcycles`);
    return c.json({ motorcycles: processedMotorcycles });
  } catch (error) {
    console.log(`Error fetching motorcycles: ${error}`);
    return c.json({ error: 'Failed to fetch motorcycles', details: String(error) }, 500);
  }
});

// Get a single motorcycle by ID
app.get("/make-server-5130f7cd/motorcycles/:id", async (c) => {
  try {
    const id = c.req.param('id');
    console.log(`Fetching motorcycle with ID: ${id}`);
    
    const bike = await kv.get(`motorcycle:${id}`);
    
    if (!bike) {
      return c.json({ error: 'Motorcycle not found' }, 404);
    }
    
    // Get signed URL if image is in storage
    if (bike.imageStoragePath) {
      const isPhotoLibrary = bike.imageStoragePath.includes('/');
      const bucket = isPhotoLibrary ? LIBRARY_BUCKET_NAME : BUCKET_NAME;
      const url = await getCachedSignedUrl(bucket, bike.imageStoragePath);
      if (url) bike.image = url;
    }

    // Process gallery images
    if (bike.gallery && Array.isArray(bike.gallery) && bike.gallery.length > 0) {
      const validGalleryPaths = bike.gallery.filter((path: string) =>
        path && !path.includes('.folder') && !path.endsWith('/.folder')
      );

      const galleryUrls = await Promise.all(
        validGalleryPaths.map(async (path: string) => {
          if (path.startsWith('http')) return path;
          const isPhotoLibrary = path.includes('/');
          const bucket = isPhotoLibrary ? LIBRARY_BUCKET_NAME : BUCKET_NAME;
          return await getCachedSignedUrl(bucket, path);
        })
      );

      bike.gallery = galleryUrls.filter(url => url && typeof url === 'string');
    }
    
    console.log(`Successfully fetched motorcycle: ${bike.name}`);
    return c.json({ motorcycle: bike });
  } catch (error) {
    console.log(`Error fetching motorcycle: ${error}`);
    return c.json({ error: 'Failed to fetch motorcycle', details: String(error) }, 500);
  }
});

// Create or update a motorcycle
app.post("/make-server-5130f7cd/motorcycles", async (c) => {
  try {
    console.log('=== POST /motorcycles called ===');
    const body = await c.req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { id, name, category, price, description, specs, image, gallery, imageStoragePath, isDaytonaSeries, isForSale } = body;
    
    if (!id || !name || !price) {
      console.log('Validation failed - missing required fields');
      return c.json({ error: 'Missing required fields: id, name, price' }, 400);
    }
    
    console.log(`Creating/updating motorcycle: ${name} (ID: ${id})`);
    
    const motorcycle = {
      id,
      name,
      category: category || '',
      price,
      description: description || '',
      specs: specs || [],
      image: image || '',
      gallery: gallery || [], // Include gallery field
      imageStoragePath: imageStoragePath || '', // Preserve the storage path if provided
      isDaytonaSeries: isDaytonaSeries || false,
      isForSale: isForSale || false,
      updatedAt: new Date().toISOString(),
    };
    
    console.log('Motorcycle object to save:', JSON.stringify(motorcycle, null, 2));
    
    await kv.set(`motorcycle:${id}`, motorcycle);
    
    console.log(`✅ Successfully saved motorcycle: ${name}`);
    return c.json({ motorcycle, message: 'Motorcycle saved successfully' });
  } catch (error) {
    console.log(`❌ Error saving motorcycle: ${error}`);
    console.log('Error stack:', (error as Error).stack);
    return c.json({ error: 'Failed to save motorcycle', details: String(error) }, 500);
  }
});

// Delete a motorcycle
app.delete("/make-server-5130f7cd/motorcycles/:id", async (c) => {
  try {
    const id = c.req.param('id');
    console.log(`Deleting motorcycle with ID: ${id}`);
    
    const bike = await kv.get(`motorcycle:${id}`);
    
    if (!bike) {
      return c.json({ error: 'Motorcycle not found' }, 404);
    }
    
    // Delete image from storage if it exists
    if (bike.imageStoragePath) {
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([bike.imageStoragePath]);
    }
    
    await kv.del(`motorcycle:${id}`);
    
    console.log(`Successfully deleted motorcycle: ${bike.name}`);
    return c.json({ message: 'Motorcycle deleted successfully' });
  } catch (error) {
    console.log(`Error deleting motorcycle: ${error}`);
    return c.json({ error: 'Failed to delete motorcycle', details: String(error) }, 500);
  }
});

// Upload motorcycle image
app.post("/make-server-5130f7cd/motorcycles/:id/upload-image", async (c) => {
  try {
    const id = c.req.param('id');
    const formData = await c.req.formData();
    const file = formData.get('image');
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No image file provided' }, 400);
    }
    
    console.log(`Uploading image for motorcycle ID: ${id}`);
    
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Create unique file path
    const fileExtension = file.name.split('.').pop();
    const filePath = `${id}-${Date.now()}.${fileExtension}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });
    
    if (uploadError) {
      console.log(`Error uploading image: ${uploadError}`);
      return c.json({ error: 'Failed to upload image', details: String(uploadError) }, 500);
    }
    
    // Update motorcycle with image storage path
    const bike = await kv.get(`motorcycle:${id}`);
    
    if (bike) {
      // Delete old image if it exists
      if (bike.imageStoragePath) {
        await supabase.storage
          .from(BUCKET_NAME)
          .remove([bike.imageStoragePath]);
      }
      
      bike.imageStoragePath = uploadData.path;

      const signedUrl = await getCachedSignedUrl(BUCKET_NAME, uploadData.path);
      if (signedUrl) {
        bike.image = signedUrl;
      }
      
      await kv.set(`motorcycle:${id}`, bike);
    }
    
    console.log(`Successfully uploaded image for motorcycle ID: ${id}`);
    return c.json({ 
      message: 'Image uploaded successfully',
      path: uploadData.path,
    });
  } catch (error) {
    console.log(`Error uploading motorcycle image: ${error}`);
    return c.json({ error: 'Failed to upload image', details: String(error) }, 500);
  }
});

// ============================================
// PHOTO LIBRARY ENDPOINTS
// ============================================

const LIBRARY_BUCKET_NAME = 'make-5130f7cd-photo-library';

// Initialize photo library bucket on startup
async function initializePhotoLibrary() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === LIBRARY_BUCKET_NAME);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(LIBRARY_BUCKET_NAME, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      });
      console.log(`Created photo library bucket: ${LIBRARY_BUCKET_NAME}`);
    } else {
      console.log(`Photo library bucket already exists: ${LIBRARY_BUCKET_NAME}`);
    }
  } catch (error) {
    console.log(`Error initializing photo library: ${error}`);
  }
}

// Upload photo to library
app.post("/make-server-5130f7cd/photo-library/upload", async (c) => {
  try {
    console.log('=== POST /photo-library/upload called ===');
    const formData = await c.req.formData();
    const file = formData.get('image');
    const folder = formData.get('folder') as string || ''; // Get folder path
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No image file provided' }, 400);
    }
    
    console.log(`Uploading photo to library: ${file.name} in folder: ${folder || 'root'}`);
    
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Create unique file path with folder
    const fileExtension = file.name.split('.').pop();
    const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '-'); // Sanitize
    const uniqueName = `${sanitizedFileName}-${Date.now()}.${fileExtension}`;
    const filePath = folder ? `${folder}/${uniqueName}` : uniqueName;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(LIBRARY_BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });
    
    if (uploadError) {
      console.log(`Error uploading photo: ${uploadError}`);
      return c.json({ error: 'Failed to upload photo', details: String(uploadError) }, 500);
    }
    
    const signedUrl = await getCachedSignedUrl(LIBRARY_BUCKET_NAME, uploadData.path);

    console.log(`✅ Successfully uploaded photo: ${filePath}`);
    return c.json({
      message: 'Photo uploaded successfully',
      path: uploadData.path,
      url: signedUrl || '',
      name: file.name,
      folder: folder,
    });
  } catch (error) {
    console.log(`❌ Error uploading photo to library: ${error}`);
    return c.json({ error: 'Failed to upload photo', details: String(error) }, 500);
  }
});

// List all photos in library (with folder support)
app.get("/make-server-5130f7cd/photo-library", async (c) => {
  try {
    const folder = c.req.query('folder') || ''; // Get folder parameter
    console.log(`=== GET /photo-library called (folder: ${folder || 'root'}) ===`);
    
    // List files/folders in the specified path
    const { data: files, error: listError } = await supabase.storage
      .from(LIBRARY_BUCKET_NAME)
      .list(folder, {
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (listError) {
      console.log(`Error listing photos: ${listError}`);
      return c.json({ error: 'Failed to list photos', details: String(listError) }, 500);
    }
    
    // Separate folders and files
    const folders: any[] = [];
    const photos: any[] = [];
    
    for (const file of files || []) {
      // Skip .folder placeholder files completely
      if (file.name === '.folder' || file.name.includes('.folder')) {
        continue;
      }
      
      // If it's a folder (id is null for folders in Supabase)
      if (!file.id) {
        folders.push({
          name: file.name,
          path: folder ? `${folder}/${file.name}` : file.name,
          isFolder: true,
        });
      } else {
        // It's a file
        const filePath = folder ? `${folder}/${file.name}` : file.name;
        const signedUrl = await getCachedSignedUrl(LIBRARY_BUCKET_NAME, filePath);

        photos.push({
          name: file.name,
          path: filePath,
          url: signedUrl || '',
          size: file.metadata?.size || 0,
          createdAt: file.created_at,
          isFolder: false,
        });
      }
    }
    
    console.log(`✅ Successfully listed ${folders.length} folders and ${photos.length} photos`);
    return c.json({ folders, photos, currentFolder: folder });
  } catch (error) {
    console.log(`❌ Error listing photos: ${error}`);
    return c.json({ error: 'Failed to list photos', details: String(error) }, 500);
  }
});

// Create a new folder
app.post("/make-server-5130f7cd/photo-library/create-folder", async (c) => {
  try {
    const { folderName, parentFolder } = await c.req.json();
    console.log(`=== POST /photo-library/create-folder: ${folderName} ===`);
    
    if (!folderName) {
      return c.json({ error: 'Folder name is required' }, 400);
    }
    
    // Sanitize folder name
    const sanitizedName = folderName.replace(/[^a-zA-Z0-9-_ ]/g, '');
    const folderPath = parentFolder ? `${parentFolder}/${sanitizedName}` : sanitizedName;
    
    // Create a placeholder file to create the folder
    const placeholderPath = `${folderPath}/.folder`;
    const { error: uploadError } = await supabase.storage
      .from(LIBRARY_BUCKET_NAME)
      .upload(placeholderPath, new Uint8Array([]), {
        contentType: 'text/plain',
        upsert: false,
      });
    
    if (uploadError) {
      console.log(`Error creating folder: ${uploadError}`);
      return c.json({ error: 'Failed to create folder', details: String(uploadError) }, 500);
    }
    
    console.log(`✅ Successfully created folder: ${folderPath}`);
    return c.json({ message: 'Folder created successfully', path: folderPath });
  } catch (error) {
    console.log(`❌ Error creating folder: ${error}`);
    return c.json({ error: 'Failed to create folder', details: String(error) }, 500);
  }
});

// Move photo to different folder
app.post("/make-server-5130f7cd/photo-library/move", async (c) => {
  try {
    const { fromPath, toFolder } = await c.req.json();
    console.log(`=== POST /photo-library/move: ${fromPath} to ${toFolder} ===`);
    
    // Get file name from path
    const fileName = fromPath.split('/').pop();
    const newPath = toFolder ? `${toFolder}/${fileName}` : fileName;
    
    // Move file (copy then delete)
    const { error: moveError } = await supabase.storage
      .from(LIBRARY_BUCKET_NAME)
      .move(fromPath, newPath);
    
    if (moveError) {
      console.log(`Error moving photo: ${moveError}`);
      return c.json({ error: 'Failed to move photo', details: String(moveError) }, 500);
    }
    
    console.log(`✅ Successfully moved photo: ${fromPath} -> ${newPath}`);
    return c.json({ message: 'Photo moved successfully', newPath });
  } catch (error) {
    console.log(`❌ Error moving photo: ${error}`);
    return c.json({ error: 'Failed to move photo', details: String(error) }, 500);
  }
});

// Delete photo or folder from library
app.delete("/make-server-5130f7cd/photo-library/:path", async (c) => {
  try {
    const path = c.req.param('path');
    console.log(`=== DELETE /photo-library/${path} called ===`);
    
    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from(LIBRARY_BUCKET_NAME)
      .remove([path]);
    
    if (deleteError) {
      console.log(`Error deleting photo: ${deleteError}`);
      return c.json({ error: 'Failed to delete photo', details: String(deleteError) }, 500);
    }
    
    console.log(`✅ Successfully deleted photo: ${path}`);
    return c.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.log(`❌ Error deleting photo: ${error}`);
    return c.json({ error: 'Failed to delete photo', details: String(error) }, 500);
  }
});

// Fix motorcycle image paths (migration endpoint)
app.post("/make-server-5130f7cd/fix-motorcycle-paths", async (c) => {
  try {
    console.log('=== POST /fix-motorcycle-paths called ===');
    
    // Get all motorcycles
    const motorcycles = await kv.getByPrefix('motorcycle:');
    let fixedCount = 0;
    
    for (const bike of motorcycles) {
      let needsUpdate = false;
      
      // Check if image URL is from photo library but missing imageStoragePath
      if (bike.image && bike.image.includes(LIBRARY_BUCKET_NAME) && !bike.imageStoragePath) {
        // Extract the storage path from the signed URL
        // Format: https://[project].supabase.co/storage/v1/object/sign/make-5130f7cd-photo-library/[path]?token=...
        const match = bike.image.match(/make-5130f7cd-photo-library\/([^?]+)/);
        if (match && match[1]) {
          bike.imageStoragePath = decodeURIComponent(match[1]);
          needsUpdate = true;
          console.log(`Fixed ${bike.name}: set imageStoragePath to ${bike.imageStoragePath}`);
        }
      }
      
      // Fix gallery images - convert signed URLs to storage paths
      if (bike.gallery && Array.isArray(bike.gallery) && bike.gallery.length > 0) {
        console.log(`Checking gallery for ${bike.name}, has ${bike.gallery.length} images`);
        const fixedGallery: string[] = [];
        let galleryFixed = false;
        
        for (const item of bike.gallery) {
          if (typeof item === 'string' && item) {
            // Skip .folder files
            if (item.endsWith('.folder') || item.includes('.folder')) {
              console.log(`  ⏭️ Skipping .folder file`);
              galleryFixed = true; // Mark as fixed since we're removing it
              continue;
            }
            
            console.log(`  Processing gallery item: ${item.substring(0, 100)}...`);
            
            // If it's a signed URL, extract the storage path
            if (item.includes('supabase.co/storage/v1/object/sign/')) {
              // Extract from photo library bucket
              let match = item.match(/make-5130f7cd-photo-library\/([^?]+)/);
              if (match && match[1]) {
                const path = decodeURIComponent(match[1]);
                // Don't add if it's a .folder file
                if (!path.endsWith('.folder')) {
                  fixedGallery.push(path);
                  galleryFixed = true;
                  console.log(`  ✅ Fixed gallery image for ${bike.name}: ${path}`);
                }
                continue;
              }
              
              // Extract from motorcycles bucket
              match = item.match(/make-5130f7cd-motorcycles\/([^?]+)/);
              if (match && match[1]) {
                const path = decodeURIComponent(match[1]);
                // Don't add if it's a .folder file
                if (!path.endsWith('.folder')) {
                  fixedGallery.push(path);
                  galleryFixed = true;
                  console.log(`  ✅ Fixed gallery image for ${bike.name}: ${path}`);
                }
                continue;
              }
              
              console.log(`  ⚠️ Could not extract path from signed URL`);
            }
            
            // If it's an Unsplash URL or external URL, keep it as is
            if (item.startsWith('http')) {
              console.log(`  ℹ️ Keeping external URL`);
              fixedGallery.push(item);
            } else if (!item.endsWith('.folder')) {
              // It's already a storage path, keep it (unless it's a .folder file)
              console.log(`  ℹ️ Already a storage path`);
              fixedGallery.push(item);
            }
          }
        }
        
        if (galleryFixed || fixedGallery.length !== bike.gallery.length) {
          console.log(`  Gallery fixed: ${fixedGallery.length} images (was ${bike.gallery.length})`);
          bike.gallery = fixedGallery;
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        await kv.set(`motorcycle:${bike.id}`, bike);
        fixedCount++;
      }
    }
    
    console.log(`✅ Fixed ${fixedCount} motorcycles out of ${motorcycles.length} total`);
    return c.json({ 
      message: `Fixed ${fixedCount} motorcycles out of ${motorcycles.length} total`, 
      count: fixedCount,
      total: motorcycles.length
    });
  } catch (error) {
    console.log(`❌ Error fixing motorcycle paths: ${error}`);
    return c.json({ error: 'Failed to fix paths', details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);