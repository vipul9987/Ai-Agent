import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

app.use(express.json());
app.use(cors({
    origin: "https://ai-agent-i8rn-p2q7ajton-vipul9987s-projects.vercel.app", // Remove trailing `/`
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));

// Cache last request for regeneration
let lastRequest = null;

// Function to fetch webpage content
async function fetchPageContent(url) {
    try {
        const response = await axios.get(url, { timeout: 10000 });
        const $ = cheerio.load(response.data);
        const pageText = $("h1, h2, h3, p").text().trim();
        return pageText.length > 100 ? pageText : null;
    } catch (error) {
        console.error("❌ Error fetching page content:", error.message);
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
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
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
app.post("/generate-meta", async (req, res) => {
    let { url, keywords, variantCount } = req.body;

    if (!url || !keywords) {
        return res.status(400).json({ error: "URL and keywords are required." });
    }

    variantCount = parseInt(variantCount) || 1;
    let pageContent = await fetchPageContent(url);

    if (!pageContent) {
        return res.status(400).json({ error: "Could not extract enough content." });
    }

    try {
        const metaContent = await generateMetaContent(pageContent, keywords, variantCount);

        lastRequest = { url, keywords, variantCount, pageContent };

        res.json({ metaContent, url, keywords, variantCount });
    } catch (error) {
        console.error("❌ Error generating meta content:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// API Endpoint to Regenerate Meta Content
app.post("/regenerate-meta", async (req, res) => {
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

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
