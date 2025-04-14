import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.GEMINI_API_KEY;

// Check if API key is available
if (!API_KEY) {
    console.error('⚠️ GEMINI_API_KEY is not set in environment variables!');
    console.error('Please set the GEMINI_API_KEY environment variable with your Google Gemini API key.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Add a route to check API key status
app.get('/api/check-api-key', (req, res) => {
    if (!API_KEY) {
        return res.status(500).json({ error: 'API key is not configured' });
    }
    res.json({ status: 'API key is configured' });
});

app.use(express.json());
// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Get the directory name using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Cache last request for regeneration
let lastRequest = null;

// Function to fetch webpage content
async function fetchPageContent(url) {
    try {
        // Add http:// prefix if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
            console.log('Added https:// prefix to URL:', url);
        }

        console.log('Fetching content from:', url);
        const response = await axios.get(url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        console.log('Response received, parsing content...');
        const $ = cheerio.load(response.data);

        // Extract text from more elements for better content coverage
        const pageText = $("h1, h2, h3, h4, h5, p, article, section, .content, .main, main").text().trim();

        console.log(`Extracted ${pageText.length} characters of content`);

        if (pageText.length < 100) {
            console.log('Not enough content extracted, trying alternative selectors');
            // Try a more aggressive approach to get content
            const bodyText = $("body").text().trim();
            return bodyText.length > 100 ? bodyText.substring(0, 5000) : null;
        }

        // Limit text length to avoid very large requests
        return pageText.substring(0, 5000);
    } catch (error) {
        console.error("❌ Error fetching page content:", error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
        }
        return null;
    }
}


async function generateMetaContent(pageContent, keywords, variantCount) {
    const prompt = `
    ## AI Prompt for Meta Title & Description Generator

    **1️⃣ Understanding the Input**
    - You are an AI assistant designed to generate SEO-optimized meta titles and descriptions.
    - First, analyze the webpage content provided.

    **2️⃣ Strategy for Meta Generation**
    - Ensure:
      - **Meta title** (50-60 chars) includes at least **1 keyword**.
      - **Meta description** (150-160 chars) includes **2-3 keywords**.

    **3️⃣ Generate ${variantCount} Variants**
    - Provide ${variantCount} unique versions of meta titles and descriptions.

    **4️⃣ Return Only JSON Array (No Extra Text)**
    - Output **ONLY** a JSON array:
    [
      { "title": "Example Title 1", "description": "Example Description 1" },
      { "title": "Example Title 2", "description": "Example Description 2" }
    ]

    **📝 Webpage Content:**
    ${pageContent}

    **🔑 Target Keywords:** ${keywords}
    `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response.text();

        // ✅ Debugging: Print the raw AI response
        console.log("🔍 Gemini Response:", response);

        // ✅ Extract JSON from response (fixes invalid format)
        const jsonMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]); // Extract valid JSON array
        }

        console.error("❌ Invalid AI response format:", response);
        return [{ title: "Error", description: "Failed to parse AI response." }];

    } catch (error) {
        console.error("❌ AI Generation Error:", error.message);
        return [{ title: "AI Error", description: "Failed to generate content." }];
    }
}

// testing route
app.get("/test", (req, res) => {
    res.json({ message: "API is working fine!" });
});



// API Endpoint to Generate Meta Content
app.post("/api/generate-meta", async (req, res) => {
    try {
        console.log("Received request:", req.body);
        let { url, keywords, variantCount } = req.body;

        if (!url || !keywords) {
            console.log("Missing required fields:", { url, keywords });
            return res.status(400).json({ error: "URL and keywords are required." });
        }

        variantCount = parseInt(variantCount) || 1;
        console.log("Fetching content from URL:", url);
        let pageContent = await fetchPageContent(url);

        if (!pageContent) {
            console.log("Could not extract content from URL:", url);
            return res.status(400).json({ error: "Could not extract enough content from the website. Please try a different URL." });
        }

        console.log("Generating meta content with keywords:", keywords);
        const metaContent = await generateMetaContent(pageContent, keywords, variantCount);

        lastRequest = { url, keywords, variantCount, pageContent };

        console.log("Successfully generated meta content");
        res.json({ metaContent, url, keywords, variantCount });
    } catch (error) {
        console.error("❌ Error generating meta content:", error);
        console.error("Stack trace:", error.stack);
        res.status(500).json({ error: "Internal Server Error: " + error.message });
    }
});

// API Endpoint to Regenerate Meta Content
app.post("/api/regenerate-meta", async (req, res) => {
    if (!lastRequest) {
        return res.status(400).json({ error: "No previous request found. Generate first." });
    }

    try {
        const { url, keywords, variantCount, pageContent } = lastRequest;
        const metaContent = await generateMetaContent(pageContent, keywords, variantCount);
        res.json({ metaContent, url, keywords, variantCount });
    } catch (error) {
        console.error("❌ Error regenerating meta content:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Catch-all handler: for any request that doesn't match the ones above, send back React's index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
