# Supabase Management Guide for Marling Motorbikes

## Overview

Your Marling Motorbikes website is now connected to Supabase with a **custom Admin Panel** built right into your website! You have two options for managing your inventory:

1. **✨ Admin Panel** (Recommended) - Beautiful, easy-to-use interface built into your website
2. **Supabase Dashboard** - Advanced option for technical users

---

## 🎨 RECOMMENDED: Using the Built-in Admin Panel

### Accessing the Admin Panel

**Option 1 - Direct URL:**
- Go to your website and add `#admin` to the end of the URL
- Example: `https://yourwebsite.com#admin`

**Option 2 - Manual Navigation:**
- Type `#admin` in your browser's address bar after your site URL

### Logging In

- **Default Password:** `marling2026`
- This password is stored locally and protects your admin panel
- To change the password, edit the `AdminLogin.tsx` file

### Managing Motorcycles - Easy as 1-2-3!

#### 📝 Adding a New Motorcycle

1. Click the **"Add New Motorcycle"** button
2. Fill in the form:
   - **Name** - The motorcycle model name
   - **Category** - Choose from dropdown (Sport, Cruiser, Adventure, Vintage)
   - **Price** - Enter with $ symbol (e.g., $12,500)
   - **Image URL** - Paste an image link OR upload an image below
   - **Upload Image** - Click to upload from your computer (auto-uploads to Supabase)
   - **Description** - Write a detailed description
   - **Specifications** - Click "+ Add Specification" to add bullet points
3. Click **"Save Motorcycle"**
4. Done! Your new bike appears instantly on the Shop page

#### ✏️ Editing a Motorcycle

1. Find the motorcycle card you want to edit
2. Click the **"Edit"** button
3. Update any fields in the form
4. Click **"Save Motorcycle"**
5. Changes appear immediately!

#### 🗑️ Deleting a Motorcycle

1. Find the motorcycle card
2. Click the **trash can icon** (🗑️)
3. Confirm deletion
4. The motorcycle is removed from your shop

#### 🖼️ Uploading Images

**Two Ways to Add Images:**

1. **Paste Image URL:**
   - Find an image online (e.g., from Unsplash.com)
   - Copy the image URL
   - Paste into the "Image URL" field

2. **Upload from Computer:**
   - Click the upload area in the form
   - Select an image file (PNG, JPG, up to 10MB)
   - The image uploads automatically to Supabase
   - Preview appears immediately

### Admin Panel Features

✅ Beautiful visual interface - no code or JSON!  
✅ Real-time preview of all changes  
✅ Image thumbnails for all motorcycles  
✅ Drag-and-drop image uploads  
✅ Form validation to prevent mistakes  
✅ Instant save and delete  
✅ Mobile-friendly design  

---

## 📊 Alternative: Managing via Supabase Dashboard

If you prefer the technical approach, you can still use the Supabase dashboard directly:

### Accessing the Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in with your Supabase account
3. Select your Marling Motorbikes project

### Finding Your Motorcycle Data

1. In the left sidebar, click on **"Table Editor"**
2. Look for the table named: `kv_store_5130f7cd`
3. You'll see all your stored data here

---

## 🏍️ How Motorcycles Are Stored

Each motorcycle is stored with a key like: `motorcycle:1`, `motorcycle:2`, etc.

The **value** field contains all the motorcycle details in JSON format:

```json
{
  "id": 1,
  "name": "Airborne",
  "category": "sport",
  "price": "$12,500",
  "description": "A high-performance sport bike...",
  "image": "https://...",
  "specs": [
    "Engine: 600cc Inline-4",
    "Power: 120 HP @ 13,500 RPM",
    "Weight: 410 lbs"
  ]
}
```

---

## ✏️ Editing a Motorcycle

### Via Supabase Dashboard (Recommended for Simple Changes)

1. Open **Table Editor** → `kv_store_5130f7cd`
2. Find the row with key `motorcycle:{id}` (e.g., `motorcycle:1` for Airborne)
3. Click on the **value** cell
4. Edit the JSON data:
   - **name**: Change the motorcycle name
   - **price**: Update the price (format: "$12,500")
   - **description**: Edit the description text
   - **category**: Choose from: `sport`, `cruiser`, `adventure`, `vintage`
   - **specs**: Add/edit specifications (each spec is a string in the array)
5. Click outside the cell or press Enter to save

### Important Fields Explained

- **id** (number): Unique identifier - don't change this
- **name** (text): Motorcycle model name
- **category** (text): Must be one of: `sport`, `cruiser`, `adventure`, `vintage`
- **price** (text): Display price (e.g., "$12,500")
- **description** (text): Full product description
- **image** (URL): Link to the motorcycle image
- **specs** (array): List of specifications like ["Engine: 600cc", "Power: 120 HP"]

---

## ➕ Adding a New Motorcycle

### Method 1: Using the Table Editor

1. Go to **Table Editor** → `kv_store_5130f7cd`
2. Click **"Insert"** → **"Insert row"**
3. Fill in the fields:
   - **key**: Enter `motorcycle:9` (use the next available number)
   - **value**: Paste this template and customize:

```json
{
  "id": 9,
  "name": "Your Bike Name",
  "category": "sport",
  "price": "$15,000",
  "description": "Your bike description here",
  "image": "https://your-image-url.com/bike.jpg",
  "specs": [
    "Engine: 800cc V-Twin",
    "Power: 100 HP",
    "Weight: 450 lbs"
  ]
}
```

4. Click **"Save"**
5. Refresh your website to see the new motorcycle

---

## 🖼️ Managing Motorcycle Images

### Option 1: Use External Image URLs (Easiest)

Just paste any image URL into the `image` field:
- Unsplash URLs work great
- Your own hosting service URLs
- Any publicly accessible image URL

### Option 2: Upload to Supabase Storage

1. In Supabase dashboard, go to **Storage**
2. Find the bucket: `make-5130f7cd-motorcycles`
3. Click **"Upload file"**
4. Select your motorcycle image (max 10MB)
5. After upload, click the three dots next to the image → **"Copy URL"**
6. Use this URL in your motorcycle's `image` field

**Note:** Images in Supabase Storage are private and will be automatically converted to secure signed URLs by the system.

---

## 🗑️ Deleting a Motorcycle

1. Go to **Table Editor** → `kv_store_5130f7cd`
2. Find the motorcycle row (e.g., `motorcycle:5`)
3. Click the checkbox on the left side of the row
4. Click the **"Delete"** button at the top
5. Confirm the deletion

---

## 💡 Tips for Non-Technical Users

### Editing Prices
- Always include the `$` symbol: `"$12,500"`
- Use commas for thousands: `"$22,500"` not `"$22500"`

### Categories Must Match Exactly
Your website has filter buttons for these categories:
- `sport` - Sport bikes
- `cruiser` - Cruiser bikes
- `adventure` - Adventure bikes
- `vintage` - Vintage/classic bikes

**Spelling matters!** Use lowercase and match exactly.

### Editing Specifications
Specs are stored as a list. Each item should be a complete sentence:
```json
"specs": [
  "Engine: 1000cc Inline-4",
  "Power: 180 HP @ 14,000 RPM",
  "Weight: 440 lbs",
  "Top Speed: 186 mph"
]
```

Add commas between items, and use square brackets `[ ]`.

### Finding Image URLs
- Use [Unsplash.com](https://unsplash.com) for free motorcycle photos
- Search for "motorcycle", "sport bike", "cruiser motorcycle", etc.
- Right-click an image → "Copy image address"
- Paste the URL into the `image` field

---

## 🔧 Troubleshooting

### My changes aren't showing on the website
- **Solution**: Refresh your browser (Ctrl+F5 or Cmd+Shift+R)
- The website fetches fresh data each time you visit the Shop page

### I see an error when editing
- **Check your JSON formatting**: Make sure you have proper quotes, commas, and brackets
- Use a JSON validator online if needed: [jsonlint.com](https://jsonlint.com)

### A motorcycle disappeared
- Check the **key** field - it must start with `motorcycle:`
- The ID in the key must match the ID in the value: `motorcycle:5` → `"id": 5`

### Image not loading
- Make sure the image URL is publicly accessible
- Test the URL by pasting it in a new browser tab
- If using Supabase Storage, the system will auto-generate secure URLs

---

## 📱 When You Export to Hostinger

When you're ready to move your website to Hostinger or another hosting platform:

1. **Export your code** from Figma Make
2. **Upload to Hostinger** as usual
3. **Keep using the same Supabase project**
   - Your motorcycle data stays in Supabase (it's cloud-based)
   - You'll continue managing bikes through the same Supabase dashboard
   - No data migration needed!

4. **Add your Supabase credentials** to the hosted site:
   - You'll need your Supabase Project URL
   - You'll need your Public Anon Key
   - These are found in Supabase Dashboard → Settings → API

Everything will work the same way - Supabase is independent of where your website is hosted!

---

## 🎯 Quick Reference

| Task | Location | Action |
|------|----------|--------|
| Edit motorcycle details | Table Editor → kv_store_5130f7cd | Click cell, edit JSON, save |
| Add new motorcycle | Table Editor → Insert row | Use template above |
| Delete motorcycle | Table Editor → Select row | Click delete |
| Upload images | Storage → make-5130f7cd-motorcycles | Upload file, copy URL |
| View all data | Table Editor | View kv_store_5130f7cd table |

---

## 📞 Need Help?

- **Supabase Documentation**: [https://supabase.com/docs](https://supabase.com/docs)
- **JSON Format Help**: [https://jsonlint.com](https://jsonlint.com)
- **Free Motorcycle Photos**: [https://unsplash.com/s/photos/motorcycle](https://unsplash.com/s/photos/motorcycle)

---

**Remember**: You never need to touch code to manage your motorcycles. Everything can be done through the Supabase dashboard!
