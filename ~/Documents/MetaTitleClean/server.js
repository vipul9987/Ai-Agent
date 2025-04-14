const express = require('express');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5001; // Using 5001 to avoid conflicts

// Middleware
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Meta generation endpoint (legacy path)
app.post('/generate-meta', (req, res) => {
  try {
    console.log('Received request to legacy endpoint:', req.body);
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

// Meta generation endpoint (new path)
app.post('/api/generate-meta', (req, res) => {
  try {
    console.log('Received request to new endpoint:', req.body);
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
