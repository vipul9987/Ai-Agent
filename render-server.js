import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

// Setup Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

// Get directory name for serving static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Health check endpoint
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Legacy endpoint for backward compatibility
app.post("/generate-meta", async (req, res) => {
  try {
    console.log("Received request to legacy endpoint:", req.body);
    const { url, keywords, variantCount } = req.body;

    if (!url || !keywords) {
      return res.status(400).json({ 
        error: "URL and keywords are required." 
      });
    }

    // Generate hardcoded response for testing
    const metaContent = [
      {
        title: `${keywords} - Example Website Title (Legacy Endpoint)`,
        description: `This is an example description for ${url} that includes keywords like ${keywords}. This is just a placeholder to verify the API is working correctly.`
      }
    ];

    // Return the response
    res.json({ 
      metaContent, 
      url, 
      keywords, 
      variantCount 
    });
  } catch (error) {
    console.error("Error in legacy endpoint:", error);
    res.status(500).json({ 
      error: "Internal Server Error: " + error.message 
    });
  }
});

// New endpoint path
app.post("/api/generate-meta", async (req, res) => {
  try {
    console.log("Received request to new endpoint:", req.body);
    const { url, keywords, variantCount } = req.body;

    if (!url || !keywords) {
      return res.status(400).json({ 
        error: "URL and keywords are required." 
      });
    }

    // Generate hardcoded response for testing
    const metaContent = [
      {
        title: `${keywords} - Example Website Title (New Endpoint)`,
        description: `This is an example description for ${url} that includes keywords like ${keywords}. This is just a placeholder to verify the API is working correctly.`
      }
    ];

    // Return the response
    res.json({ 
      metaContent, 
      url, 
      keywords, 
      variantCount 
    });
  } catch (error) {
    console.error("Error in new endpoint:", error);
    res.status(500).json({ 
      error: "Internal Server Error: " + error.message 
    });
  }
});

// Catch-all handler
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
