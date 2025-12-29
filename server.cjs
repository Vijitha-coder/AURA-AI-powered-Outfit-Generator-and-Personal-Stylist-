const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
// Use PORT env var if set; default to 3002 to avoid conflicting with the frontend dev server
const port = process.env.PORT || 3002; // Port for our backend API

// Middleware
app.use(cors()); // Allow requests from our frontend
app.use(express.json({ limit: '10mb' })); // Allow parsing of JSON request bodies (and increase limit for images)

// Ensure database file lives next to this server file
const dbFile = path.resolve(__dirname, 'wardrobe.sqlite');

// Connect to SQLite database
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log('Connected to the wardrobe SQLite database at', dbFile);
});

// Create the wardrobe table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS wardrobe (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  imageData TEXT NOT NULL,
  mimeType TEXT NOT NULL,
  category TEXT,
  color TEXT,
  pattern TEXT,
  style TEXT,
  season TEXT,
  description TEXT
)`);

// --- API Endpoints ---

// POST /api/analyze - Analyze an uploaded clothing image using GenAI (server-side)
app.post('/api/analyze', express.json({ limit: '15mb' }), async (req, res) => {
  const { imageBase64, mimeType } = req.body || {};
  if (!imageBase64 || !mimeType) return res.status(400).json({ error: 'Missing imageBase64 or mimeType' });

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
          { inlineData: { data: imageBase64, mimeType } },
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

// GET /api/wardrobe - Fetch all clothing items
app.get('/api/wardrobe', (req, res) => {
  db.all('SELECT * FROM wardrobe', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Convert ID to string to match frontend type
    const items = rows.map(item => ({ ...item, id: String(item.id) }));
    res.json(items);
  });
});

// POST /api/wardrobe - Add a new clothing item
app.post('/api/wardrobe', (req, res) => {
  const { imageData, mimeType, category, color, pattern, style, season, description } = req.body;
  const sql = `INSERT INTO wardrobe (imageData, mimeType, category, color, pattern, style, season, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [imageData, mimeType, category, color, pattern, style, season, description], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Return the newly created item with its new ID
    res.status(201).json({ ...req.body, id: String(this.lastID) });
  });
});

// DELETE /api/wardrobe/:id - Delete a clothing item
app.delete('/api/wardrobe/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM wardrobe WHERE id = ?', id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({ message: 'Item deleted successfully' });
  });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(port, () => {
  console.log(`Aura backend server listening on http://localhost:${port}`);
});
