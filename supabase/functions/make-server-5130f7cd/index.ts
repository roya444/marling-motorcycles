import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.ts";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';

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
const LIBRARY_BUCKET_NAME = 'make-5130f7cd-photo-library';

// Build a public URL for a storage object
function getPublicUrl(bucket: string, path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodeURI(path)}`;
}

async function initializeStorage() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();

    for (const name of [BUCKET_NAME, LIBRARY_BUCKET_NAME]) {
      const exists = buckets?.some(b => b.name === name);
      if (!exists) {
        await supabase.storage.createBucket(name, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        console.log(`Created public storage bucket: ${name}`);
      } else {
        // Update existing bucket to public
        await supabase.storage.updateBucket(name, { public: true });
        console.log(`Storage bucket set to public: ${name}`);
      }
    }
  } catch (error) {
    console.log(`Error initializing storage: ${error}`);
  }
}

// Initialize storage buckets on startup
initializeStorage().then(() => {
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

    const processedMotorcycles = motorcycles.map((bike) => {
      const processedBike = { ...bike };

      // Process main image
      if (bike.imageStoragePath) {
        const isPhotoLibrary = bike.imageStoragePath.includes('/');
        const bucket = isPhotoLibrary ? LIBRARY_BUCKET_NAME : BUCKET_NAME;
        processedBike.image = getPublicUrl(bucket, bike.imageStoragePath);
      }

      // Process gallery images
      if (bike.gallery && Array.isArray(bike.gallery) && bike.gallery.length > 0) {
        processedBike.gallery = bike.gallery
          .filter((path: string) => path && !path.includes('.folder'))
          .map((path: string) => {
            if (path.startsWith('http')) return path;
            const isPhotoLibrary = path.includes('/');
            const bucket = isPhotoLibrary ? LIBRARY_BUCKET_NAME : BUCKET_NAME;
            return getPublicUrl(bucket, path);
          });
      }

      return processedBike;
    });

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

    if (bike.imageStoragePath) {
      const isPhotoLibrary = bike.imageStoragePath.includes('/');
      const bucket = isPhotoLibrary ? LIBRARY_BUCKET_NAME : BUCKET_NAME;
      bike.image = getPublicUrl(bucket, bike.imageStoragePath);
    }

    if (bike.gallery && Array.isArray(bike.gallery) && bike.gallery.length > 0) {
      bike.gallery = bike.gallery
        .filter((path: string) => path && !path.includes('.folder'))
        .map((path: string) => {
          if (path.startsWith('http')) return path;
          const isPhotoLibrary = path.includes('/');
          const bucket = isPhotoLibrary ? LIBRARY_BUCKET_NAME : BUCKET_NAME;
          return getPublicUrl(bucket, path);
        });
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
    const body = await c.req.json();
    const { id, name, category, price, description, specs, image, gallery, imageStoragePath, isDaytonaSeries, isForSale } = body;

    if (!id || !name || !price) {
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
      gallery: gallery || [],
      imageStoragePath: imageStoragePath || '',
      isDaytonaSeries: isDaytonaSeries || false,
      isForSale: isForSale || false,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`motorcycle:${id}`, motorcycle);

    console.log(`✅ Successfully saved motorcycle: ${name}`);
    return c.json({ motorcycle, message: 'Motorcycle saved successfully' });
  } catch (error) {
    console.log(`❌ Error saving motorcycle: ${error}`);
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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const fileExtension = file.name.split('.').pop();
    const filePath = `${id}-${Date.now()}.${fileExtension}`;

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

    const bike = await kv.get(`motorcycle:${id}`);

    if (bike) {
      if (bike.imageStoragePath) {
        await supabase.storage
          .from(BUCKET_NAME)
          .remove([bike.imageStoragePath]);
      }

      bike.imageStoragePath = uploadData.path;
      bike.image = getPublicUrl(BUCKET_NAME, uploadData.path);

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

// Upload photo to library
app.post("/make-server-5130f7cd/photo-library/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('image');
    const folder = formData.get('folder') as string || '';

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No image file provided' }, 400);
    }

    const originalName = (formData.get('originalName') as string) || file.name || 'image.jpg';
    console.log(`Uploading photo to library: ${originalName} in folder: ${folder || 'root'}`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const fileExtension = originalName.split('.').pop() || 'jpg';
    const fileName = originalName.replace(/\.[^/.]+$/, '');
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '-');
    const uniqueName = `${sanitizedFileName}-${Date.now()}.${fileExtension}`;
    const filePath = folder ? `${folder}/${uniqueName}` : uniqueName;

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

    const publicUrl = getPublicUrl(LIBRARY_BUCKET_NAME, uploadData.path);

    console.log(`✅ Successfully uploaded photo: ${filePath}`);
    return c.json({
      message: 'Photo uploaded successfully',
      path: uploadData.path,
      url: publicUrl,
      name: originalName,
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
    const folder = c.req.query('folder') || '';
    console.log(`=== GET /photo-library called (folder: ${folder || 'root'}) ===`);

    const { data: files, error: listError } = await supabase.storage
      .from(LIBRARY_BUCKET_NAME)
      .list(folder, {
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (listError) {
      console.log(`Error listing photos: ${listError}`);
      return c.json({ error: 'Failed to list photos', details: String(listError) }, 500);
    }

    const folders: any[] = [];
    const photos: any[] = [];

    for (const file of files || []) {
      if (file.name === '.folder' || file.name.includes('.folder')) {
        continue;
      }

      if (!file.id) {
        folders.push({
          name: file.name,
          path: folder ? `${folder}/${file.name}` : file.name,
          isFolder: true,
        });
      } else {
        const filePath = folder ? `${folder}/${file.name}` : file.name;
        photos.push({
          name: file.name,
          path: filePath,
          url: getPublicUrl(LIBRARY_BUCKET_NAME, filePath),
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

    if (!folderName) {
      return c.json({ error: 'Folder name is required' }, 400);
    }

    const sanitizedName = folderName.replace(/[^a-zA-Z0-9-_ ]/g, '');
    const folderPath = parentFolder ? `${parentFolder}/${sanitizedName}` : sanitizedName;

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

    const fileName = fromPath.split('/').pop();
    const newPath = toFolder ? `${toFolder}/${fileName}` : fileName;

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

Deno.serve(app.fetch);
