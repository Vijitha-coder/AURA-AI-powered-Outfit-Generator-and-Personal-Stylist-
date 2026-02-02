const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

// Middleware
// CORS configuration for separated frontend/backend deployment
const corsOptions = {
  origin: [
    'http://localhost:3000',      // Local frontend
    'http://localhost:5173',      // Vite dev server
    'https://aura-ai-powered-outfit-generator-an.vercel.app',  // Production Vercel domain
    process.env.FRONTEND_URL      // Allow custom frontend URL via env
  ].filter(Boolean),
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Serve static files from dist (frontend build) - only for Render single-service deployment
app.use(express.static(path.join(__dirname, 'dist')));

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Connected to Supabase');

// Helper function to upload image to Supabase Storage
async function uploadImageToStorage(imageBase64, mimetype, itemId) {
  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(imageBase64, 'base64');
    
    // Determine file extension from mime type
    const mimeToExt = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
    };
    const ext = mimeToExt[mimetype] || 'jpg';
    const fileName = `${itemId}.${ext}`;

    // Upload to Supabase Storage bucket 'wardrobe-images'
    const { data, error } = await supabase.storage
      .from('wardrobe-images')
      .upload(fileName, buffer, {
        contentType: mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    // Get the public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from('wardrobe-images')
      .getPublicUrl(fileName);

    return urlData?.publicUrl;
  } catch (err) {
    throw new Error(`Failed to upload image: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// Helper function to delete image from Supabase Storage
async function deleteImageFromStorage(itemId, mimetype) {
  try {
    const mimeToExt = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
    };
    const ext = mimeToExt[mimetype] || 'jpg';
    const fileName = `${itemId}.${ext}`;

    const { error } = await supabase.storage
      .from('wardrobe-images')
      .remove([fileName]);

    if (error) {
      console.warn(`Failed to delete image ${fileName}:`, error.message);
      // Don't throw - continue with DB deletion even if storage deletion fails
    }
  } catch (err) {
    console.warn(`Storage delete error for item ${itemId}:`, err);
    // Continue with DB deletion even if storage deletion fails
  }
}

// --- API Endpoints ---

// POST /api/analyze - Analyze an uploaded clothing image using GenAI (server-side)
app.post('/api/analyze', express.json({ limit: '15mb' }), async (req, res) => {
  const { imageBase64, mimetype } = req.body || {};
  if (!imageBase64 || !mimetype) return res.status(400).json({ error: 'Missing imageBase64 or mimetype' });

  // Expect GENAI_API_KEY in environment on server
  const GENAI_API_KEY = process.env.GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!GENAI_API_KEY) {
    return res.status(500).json({ error: 'Server missing GENAI_API_KEY environment variable' });
  }

  try {
    // Dynamically import the SDK (works in CommonJS too)
    const genai = await import('@google/genai');
    const { GoogleGenAI, Type } = genai;
    const ai = new GoogleGenAI({ apiKey: GENAI_API_KEY });

    const prompt = `You are an expert fashion cataloging AI. Your sole task is to analyze the provided image of a clothing item and return a single, valid JSON object with the specified schema. Do not include any text before or after the JSON. Analyze the user-provided image and return *only* the JSON object.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: imageBase64, mimeType: mimetype } },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ['tops', 'bottoms', 'dress', 'shoes', 'accessories', 'outerwear'] },
            color: { type: Type.STRING },
            pattern: { type: Type.STRING, enum: ['solid', 'striped', 'floral', 'plaid', 'graphic', 'polka dot', 'null'] },
            style: { type: Type.STRING, enum: ['casual', 'formal', 'business', 'athletic', 'streetwear', 'bohemian', 'minimalist'] },
            season: { type: Type.STRING, enum: ['spring', 'summer', 'fall', 'winter', 'all-season'] },
            description: { type: Type.STRING },
          },
          required: ['category', 'color', 'pattern', 'style', 'season', 'description'],
        },
      },
    });

    // response.text should be the JSON string
    const analysis = JSON.parse(response.text);
    return res.json(analysis);
  } catch (err) {
    console.error('Analyze error:', err);
    return res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/wardrobe - Fetch all clothing items for the current user
app.get('/api/wardrobe', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = userData.user.id;

    // Fetch user's wardrobe items
    const { data, error } = await supabase
      .from('wardrobe')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (err) {
    console.error('Fetch wardrobe error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/wardrobe - Add a new clothing item
app.post('/api/wardrobe', async (req, res) => {
  const { imageData, mimetype, category, color, pattern, style, season, description } = req.body;

  if (!imageData || !mimetype) {
    return res.status(400).json({ error: 'Missing imageData or mimetype' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = userData.user.id;

    // First, insert the item without the image URL to get an ID
    // Omit created_at to let database handle it (avoids schema cache issues)
    const { data: insertedData, error: insertError } = await supabase
      .from('wardrobe')
      .insert({
        user_id: userId,
        mimetype,
        category,
        color,
        pattern,
        style,
        season,
        description,
      })
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ error: insertError.message });
    }

    if (!insertedData || insertedData.length === 0) {
      return res.status(500).json({ error: 'Failed to create wardrobe item' });
    }

    const itemId = insertedData[0].id;

    // Upload image to storage
    const imageUrl = await uploadImageToStorage(imageData, mimetype, itemId);

    // Update the item with the image URL
    const { data: updatedData, error: updateError } = await supabase
      .from('wardrobe')
      .update({ imageurl: imageUrl })
      .eq('id', itemId)
      .select();

    if (updateError) {
      console.error('Failed to update item with image URL:', updateError);
      return res.status(500).json({ error: 'Failed to save image URL' });
    }

    res.status(201).json(updatedData[0]);
  } catch (err) {
    console.error('Add wardrobe item error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /api/wardrobe/:id - Delete a clothing item
app.delete('/api/wardrobe/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = userData.user.id;

    // Get the item first to verify ownership and retrieve mimetype
    const { data: itemData, error: fetchError } = await supabase
      .from('wardrobe')
      .select('mimetype, user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Verify user owns this item
    if (itemData.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized - you do not own this item' });
    }

    // Delete image from storage
    if (itemData && itemData.mimetype) {
      await deleteImageFromStorage(id, itemData.mimetype);
    }

    // Delete item from database
    const { error: deleteError } = await supabase
      .from('wardrobe')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(500).json({ error: deleteError.message });
    }

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Delete wardrobe item error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve React app for all non-API routes (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Aura backend server listening on port ${port}`);
});
