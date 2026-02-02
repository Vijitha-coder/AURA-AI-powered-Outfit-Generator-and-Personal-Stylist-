# Complete Supabase Setup Guide for AURA

This guide assumes you haven't set anything up yet. Follow each step carefully.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Sign Up"** (or "Start your project")
3. Sign up with your email or GitHub account
4. Verify your email
5. You'll be redirected to the dashboard

## Step 2: Create a New Supabase Project

1. In the Supabase dashboard, click **"New Project"**
2. Fill in the project details:
   - **Name:** `aura-wardrobe` (or any name you prefer)
   - **Database Password:** Create a **strong password** (save this somewhere safe - you might need it later)
   - **Region:** Choose the region closest to you (e.g., `us-east-1` for USA, `eu-west-1` for Europe)
3. Click **"Create new project"**
4. **Wait 3-5 minutes** for the project to be provisioned - you'll see a loading screen

Once ready, you'll see the project dashboard.

## Step 3: Get Your Credentials

1. In the Supabase dashboard, go to **Settings** → **API** (left sidebar)
2. You'll see your project credentials. Copy these three values:
   - **Project URL** - looks like `https://abcdef123456.supabase.co`
   - **anon public** - a long key starting with `eyJh...`
   - **service_role** - another long key (this is SECRET - don't share it)

Keep these handy - you'll need them in Step 6.

## Step 4: Create the Database Table

1. Still in the Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"** (top right)
3. Paste this entire SQL code:

```sql
-- Create wardrobe table with user tracking
CREATE TABLE wardrobe (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  imageUrl TEXT,
  mimeType TEXT NOT NULL,
  category TEXT,
  color TEXT,
  pattern TEXT,
  style TEXT,
  season TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE wardrobe ENABLE ROW LEVEL SECURITY;

-- Create RLS policy - users can only see their own items
CREATE POLICY "Users can see their own wardrobe" ON wardrobe
  FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policy - users can insert their own items
CREATE POLICY "Users can insert their own wardrobe" ON wardrobe
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policy - users can update their own items
CREATE POLICY "Users can update their own wardrobe" ON wardrobe
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policy - users can delete their own items
CREATE POLICY "Users can delete their own wardrobe" ON wardrobe
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_wardrobe_user_id ON wardrobe(user_id);
```

4. Click **"Run"** (bottom right, or Ctrl+Enter)
5. You should see a success message - the table is now created

## Step 5: Create the Storage Bucket

1. In the Supabase dashboard, go to **Storage** (left sidebar)
2. Click **"Create a new bucket"**
3. In the dialog:
   - **Name:** `wardrobe-images` (exactly this name)
   - **Public bucket:** Toggle this **ON** (blue)
4. Click **"Create bucket"**
5. You should see the bucket appear in the list

## Step 6: Update Your .env File

1. In VS Code, open the file `.env` at the root of your project
2. Replace the entire content with this:

```env
VITE_API_KEY=AIzaSyBmkp_NsAKYPoh_0DWOtcYEiwlEiDGRCD4

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Backend Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here
```

3. Now replace the placeholder values with your actual credentials from Step 3:
   - Replace `https://your-project-id.supabase.co` with your **Project URL** (use the same for both VITE_SUPABASE_URL and SUPABASE_URL)
   - Replace `your_supabase_anon_key_here` with your **anon public** key (use for VITE_SUPABASE_ANON_KEY)
   - Replace `your_supabase_service_role_key_here` with your **service_role** key (use for SUPABASE_SERVICE_KEY)

**Example of what it should look like:**
```env
VITE_API_KEY=AIzaSyBmkp_NsAKYPoh_0DWOtcYEiwlEiDGRCD4

VITE_SUPABASE_URL=https://abcdef123456.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

SUPABASE_URL=https://abcdef123456.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Save the file** (Ctrl+S)

## Step 7: Install Dependencies

1. Open a terminal in VS Code (Terminal → New Terminal, or Ctrl+`)
2. Make sure you're in the project directory:
   ```
   cd d:\Hackathon\AURA-AI-powered-Outfit-Generator-and-Personal-Stylist-
   ```
3. Run:
   ```bash
   npm install
   ```
4. **Wait** for it to finish - you'll see "added X packages"

## Step 8: Start the Backend Server

1. In the same terminal, run:
   ```bash
   npm run start:server
   ```
2. You should see:
   ```
   Connected to Supabase
   Aura backend server listening on http://localhost:3002
   ```

✅ **If you see this, the server is working!** Leave this terminal running.

## Step 9: Start the Frontend (In a New Terminal)

1. Open a **new terminal** (Terminal → New Terminal)
2. Make sure you're in the same project directory
3. Run:
   ```bash
   npm run dev
   ```
4. You should see output like:
   ```
   Local:   http://localhost:5173/
   ```
5. Open this URL in your browser

## Step 10: Test Everything

1. In your browser, go to the app (usually http://localhost:5173)
2. You should see the **Login page**
3. Create a new account:
   - Click **Sign Up**
   - Enter your email and password
   - Click **Sign Up**
4. You should be redirected to the **Dashboard**
5. Try adding a clothing item:
   - Go to **My Wardrobe** → **Add Item**
   - Upload an image
   - Fill in the details (category, color, etc.)
   - Click **"Add Item"**
6. The item should appear in your wardrobe
7. Try logging out:
   - Click **Logout** button in the header
   - You should be redirected to the login page
8. Log back in with the same email and password
   - Your wardrobe items should still be there (they're tied to your account)

## Verify It's Working

**Check the Database:**
1. Go to Supabase dashboard → **Table Editor** (left sidebar)
2. Click on **wardrobe** table
3. You should see your added items with `imageUrl` populated

**Check the Storage:**
1. Go to Supabase dashboard → **Storage**
2. Click on **wardrobe-images** bucket
3. You should see image files (named by ID: `1.jpg`, `2.png`, etc.)

## Authentication System

Your AURA app now includes **Supabase Authentication** for user accounts:

### How It Works

1. **Sign Up** - Create an account with email/password
2. **Sign In** - Login to your account
3. **Private Wardrobe** - Each user can only see their own wardrobe items
4. **Automatic Logout** - Click the logout button to sign out
5. **Session Management** - Your session persists across browser refreshes

### Key Features

✅ **Email & Password Authentication** - Simple and secure
✅ **Private Data** - Users can only see their own wardrobe
✅ **Automatic Cleanup** - When you delete an account, all your data is deleted
✅ **Row Level Security** - Database enforces privacy at the SQL level

### Pages

- **Login** (`/login`) - Sign in with existing account
- **Signup** (`/signup`) - Create a new account
- **Dashboard** (protected) - Main app, only for logged-in users
- **All other pages** (protected) - All require authentication

### Default Behavior

When you first visit the app:
- If not logged in → redirected to `/login`
- If logged in → can access all pages
- If you log out → redirected to `/login`

## Troubleshooting

### "Missing VITE_SUPABASE_URL" error
- Check `.env` file has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (for frontend)
- Restart dev server after updating `.env`

### "Unauthorized" error when adding items
- Make sure you're logged in and have an active session
- Check browser console (F12) for more details
- Try logging out and logging back in

### Server won't start / "Missing Supabase credentials" error
- Check `.env` file has `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` (for backend)
- Make sure you copied the credentials correctly (no extra spaces)
- Restart the server: Stop terminal (Ctrl+C), then run `npm run start:server` again
- Check `.env` file has all three values
- Make sure you copied the credentials correctly (no extra spaces)
- Restart the server: Stop terminal (Ctrl+C), then run `npm run start:server` again

### "Table does not exist" error
- Make sure you ran the SQL in Step 4
- Table name must be exactly `wardrobe` (lowercase)
- Refresh the browser and try again

### "Storage bucket does not exist" error
- Make sure you created the bucket in Step 5
- Bucket name must be exactly `wardrobe-images` (lowercase)
- Make sure the bucket is set to **Public**

### Images not showing in the app
- Check that Supabase Storage bucket is **Public**
- Check the Supabase Storage section - images should be there
- Try adding a new item and see if it works

### "CORS" errors in browser console
- This is normal for the first test
- The server (http://localhost:3002) and frontend (http://localhost:5173) are different origins
- CORS is already configured - should work fine

### Network errors when adding items
- Make sure the backend server is running (`npm run start:server`)
- Make sure you're on http://localhost:5173 (not another port)
- Check the browser console (F12) for error messages

## Environment Variables Reference

| Variable | What It Is | Example | Where It's Used |
|----------|-----------|---------|-----------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://abcdef123456.supabase.co` | Frontend authentication |
| `VITE_SUPABASE_ANON_KEY` | Public API key for frontend | Starts with `eyJh...` | Frontend authentication |
| `SUPABASE_URL` | Your Supabase project URL | `https://abcdef123456.supabase.co` | Backend database |
| `SUPABASE_SERVICE_KEY` | Secret backend key | Starts with `eyJh...` - KEEP SECRET! | Backend database & auth |
| `VITE_API_KEY` | Google Gemini API key | Your API key | Image analysis |

## ⚠️ Security Notes

1. **Never commit `.env` to Git** - it contains secrets
2. **`SUPABASE_SERVICE_KEY` is secret** - only use on backend server
3. **In production**, use proper Row Level Security (RLS) policies
4. The `.env` file is already in `.gitignore` - it won't be committed

## What Happens Behind the Scenes

When you add a wardrobe item:
1. Frontend captures the image (as base64)
2. Sends it to the backend with details (color, category, etc.)
3. Backend uploads the image to Supabase Storage
4. Supabase generates a public URL for the image
5. Backend saves the URL (not the image data) to the database
6. Frontend receives the response with `imageUrl`
7. Next time you load, the app fetches items and displays them using the URLs

When you delete an item:
1. Frontend sends delete request with the item ID
2. Backend deletes the item from the database
3. Backend also deletes the image file from Storage
4. Cleanup is complete

## Success! 🎉

Your AURA app now has:
- ✅ User authentication (login/signup)
- ✅ Private wardrobe per user
- ✅ All images stored in cloud (free 1 GB)
- ✅ Database synced to the cloud
- ✅ No more local SQLite database
- ✅ Data persists across sessions
- ✅ Can access from anywhere (if deployed)

## Next Steps

- **Add more items** to test the app
- **Deploy the app** (optional - can use Vercel, Railway, Render, etc.)
- **Customize styling** - modify the React components
- **Add more features** - outfit generation, ratings, etc.

## Need Help?

- **Supabase docs:** https://supabase.com/docs
- **Error messages:** Check terminal output and browser console (F12)
- **Getting stuck?** Double-check you completed all 10 steps in order
