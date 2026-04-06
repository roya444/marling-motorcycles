# 🎨 Admin Panel User Guide

## Quick Start

### How to Access

1. **Go to your website**
2. **Add `#admin` to the URL**
   - Example: `https://yoursite.com#admin`
   - Or `http://localhost:5173#admin` (in development)

3. **Login with the password:**
   - Default: `Matlock6262!`

---

## 🏍️ Managing Your Motorcycles

### Adding a New Motorcycle

1. Click the green **"Add New Motorcycle"** button
2. A form will open - fill in the details:

   **Required Fields:**
   - **Name** - Example: "Thunder Bolt 850"
   - **Category** - Select from dropdown: Sport, Cruiser, Adventure, or Vintage
   - **Price** - Example: "$15,500" (include the $ sign)

   **Optional Fields:**
   - **Image URL** - Paste a link to an image
   - **Upload Image** - Or click to upload from your computer
   - **Description** - Write about the bike
   - **Specifications** - Add details like "Engine: 850cc V-Twin"

3. Click **"Save Motorcycle"**
4. Your new bike appears on the Shop page instantly!

---

### Editing a Motorcycle

1. Find the motorcycle you want to edit
2. Click the blue **"Edit"** button
3. The form opens with all current information
4. Change whatever you want
5. Click **"Save Motorcycle"**

**All changes are instant!** Refresh the Shop page to see updates.

---

### Deleting a Motorcycle

1. Find the motorcycle card
2. Click the red **trash can icon** (🗑️) on the right
3. Confirm you want to delete
4. The motorcycle is removed immediately

**Warning:** Deletion is permanent! The motorcycle and its image are removed from the database.

---

## 📸 Working with Images

### Option 1: Upload from Your Computer

1. In the edit/add form, find the **"Upload Image"** section
2. Click the upload area
3. Select a photo from your computer
   - Supported: JPG, PNG, GIF, WebP
   - Max size: 10MB
4. The image uploads automatically
5. You'll see a preview below

**Benefits:**
- Images stored securely in Supabase
- No need to host images elsewhere
- Automatic optimization

---

### Option 2: Use an Image URL

1. Find a motorcycle photo online
   - Recommended: [Unsplash.com](https://unsplash.com/s/photos/motorcycle) (free, high-quality)
2. Right-click the image → **"Copy image address"**
3. Paste into the **"Image URL"** field
4. Preview appears automatically

**Good Image URLs:**
```
✅ https://images.unsplash.com/photo-xyz.jpg
✅ https://your-cdn.com/bike-photo.png
❌ Don't use: Private/login-required images
```

---

## 📝 Adding Specifications

Specifications appear as bullet points on the motorcycle detail page.

**How to Add:**
1. In the edit/add form, scroll to **"Specifications"**
2. Click **"+ Add Specification"**
3. Type your spec, for example:
   - `Engine: 1000cc Inline-4`
   - `Power: 180 HP @ 14,000 RPM`
   - `Weight: 440 lbs`
   - `Top Speed: 186 mph`
4. Click **"+ Add Specification"** again for more
5. To remove, click the **X** button next to any spec

**Tips:**
- Be consistent with formatting
- Include units (HP, lbs, mph, etc.)
- Add 4-8 specs per bike

---

## 🎯 Categories Explained

Your shop has filter buttons for these categories:

| Category | Description | Examples |
|----------|-------------|----------|
| **Sport** | High-performance, speed-focused bikes | Racing bikes, superbikes |
| **Cruiser** | Comfortable, laid-back touring bikes | Harley-style, highway cruisers |
| **Adventure** | Dual-sport, on/off-road capable | Adventure tourers, dual-sport |
| **Vintage** | Classic, retro-styled motorcycles | Heritage models, cafe racers |

**Important:** The category you choose determines which filter group the bike appears in on the Shop page.

---

## 💡 Pro Tips

### Writing Good Descriptions

**Do:**
- ✅ Highlight unique features
- ✅ Mention the riding experience
- ✅ Use descriptive language
- ✅ Keep it 2-4 sentences

**Example:**
> "The Airborne combines military precision with open road freedom. Built with tactical aesthetics and unmatched performance, this sport bike delivers an exhilarating ride whether you're on the track or the highway."

---

### Pricing Format

**Correct:**
- ✅ `$12,500`
- ✅ `$8,999`
- ✅ `$22,000`

**Incorrect:**
- ❌ `12500` (missing $)
- ❌ `$12500` (missing comma)
- ❌ `12,500 USD` (use $ symbol)

---

### Finding Great Images

**Free Photo Sources:**
- [Unsplash](https://unsplash.com/s/photos/motorcycle) - High-quality, free
- [Pexels](https://www.pexels.com/search/motorcycle/) - Free stock photos
- [Pixabay](https://pixabay.com/images/search/motorcycle/) - Free images

**Search Terms:**
- "sport motorcycle"
- "cruiser motorcycle"
- "adventure bike"
- "vintage motorbike"
- "motorcycle side view"

---

## 🔒 Security

### Changing the Admin Password

1. Open the file: `/src/app/components/AdminLogin.tsx`
2. Find this line:
   ```javascript
   const ADMIN_PASSWORD = 'marling2026';
   ```
3. Change `marling2026` to your new password
4. Save the file
5. Re-deploy your site

### Who Can Access?

- Anyone with the password can access the admin panel
- The password is stored in the browser (localStorage)
- Logging out clears the session
- Admin access is separate from your website hosting

---

## 🚨 Troubleshooting

### "Changes aren't showing on the Shop page"

**Solution:** Refresh your browser
- Windows/Linux: `Ctrl + F5`
- Mac: `Cmd + Shift + R`

---

### "Image won't upload"

**Check:**
- Is the file under 10MB?
- Is it a valid image format (JPG, PNG)?
- Do you have a stable internet connection?

**Try:**
- Use a smaller image
- Convert to JPG format
- Use an image URL instead

---

### "Can't login to admin panel"

**Solution:**
- Make sure you're using the correct password: `marling2026`
- Check for typos
- Password is case-sensitive

---

### "Motorcycle disappeared"

**Check:**
- Go to Supabase Dashboard → Table Editor
- Look for the motorcycle in `kv_store_5130f7cd`
- Make sure the key starts with `motorcycle:`

---

## 📱 Mobile Access

The admin panel works on tablets and phones!

**Tips:**
- Use landscape mode for best experience
- Form scrolls smoothly on mobile
- All features work the same

---

## 🎓 Training Your Team

### For Non-Technical Users

1. **Bookmark the admin URL:**
   - `https://yoursite.com#admin`

2. **Save the password somewhere secure**

3. **Try these tasks:**
   - ✏️ Edit the price of a motorcycle
   - 📸 Upload a new image
   - ➕ Add a new specification
   - ❌ Delete a test motorcycle

4. **Remember:**
   - Changes are instant
   - Refresh the Shop page to see updates
   - You can't break anything - just edit it back!

---

## ✨ You're All Set!

The admin panel makes managing your inventory easy and visual. No more JSON editing, no more code - just simple forms and buttons.

**Need help?** Check the main [SUPABASE_GUIDE.md](./SUPABASE_GUIDE.md) for more technical details.

---

**Happy Managing! 🏍️**
