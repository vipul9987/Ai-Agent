// Import required modules
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Simple meta generation endpoint - both paths
app.post(['/generate-meta', '/api/generate-meta'], (req, res) => {
  try {
    console.log('Received request:', req.body);
    const { url, keywords, variantCount } = req.body;

    if (!url || !keywords) {
      return res.status(400).json({ error: 'URL and keywords are required' });
    }

    // Generate a simple response
    const metaContent = [
      {
        title: `${keywords} - Example Title`,
        description: `This is a sample description for ${url} with keywords: ${keywords}`
      }
    ];

    res.json({ metaContent, url, keywords, variantCount });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
