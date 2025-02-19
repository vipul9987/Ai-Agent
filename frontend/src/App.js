import React, { useState } from "react";

function App() {
    const [url, setUrl] = useState("");
    const [keywords, setKeywords] = useState("");
    const [variantCount, setVariantCount] = useState(1);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [storedData, setStoredData] = useState(null); // Store last request data for regeneration

    const API_URL = "https://ai-agent-y71e.onrender.com"
    
    const generateMeta = async (isRegenerate = false) => {
      setLoading(true);
      setResults([]);
  
      let requestData;
      if (isRegenerate && storedData) {
          requestData = storedData;
      } else {
          requestData = { url, keywords, variantCount };
          setStoredData(requestData);
      }
  
      try {
          const response = await fetch(`${API_URL}/generate-meta`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(requestData),
          });
  
          const data = await response.json();
          
          if (Array.isArray(data.metaContent)) {
              setResults(data.metaContent);
          } else {
              setResults([{ title: "Invalid Response", description: "Meta content format is incorrect." }]);
          }
      } catch (error) {
          setResults([{ title: "Server Error", description: "Please try again." }]);
      }
  
      setLoading(false);
  };
  
    return (
        <div style={{ maxWidth: "600px", margin: "20px auto", textAlign: "center" }}>
            <h1>Meta Title & Description Generator</h1>
            <input
                type="text"
                placeholder="Enter website URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />
            <input
                type="text"
                placeholder="Enter keywords (comma separated)"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />
            <input
                type="number"
                placeholder="Number of Variations"
                value={variantCount}
                onChange={(e) => setVariantCount(e.target.value)}
                min="1"
                max="5"
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />
            <button onClick={() => generateMeta(false)} style={{ padding: "10px 20px", marginRight: "10px" }}>
                {loading ? "Generating..." : "Generate Meta Content"}
            </button>
            <button onClick={() => generateMeta(true)} disabled={!storedData} style={{ padding: "10px 20px" }}>
                {loading ? "Regenerating..." : "Regenerate"}
            </button>

            {results.length > 0 && (
                <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f8f8f8" }}>
                    <h3>Generated Meta Content:</h3>
                    {results.map((variant, index) => (
                        <div key={index} style={{ marginBottom: "15px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
                            <strong>Variation {index + 1}:</strong>
                            <p><strong>Title:</strong> {variant.title}</p>
                            <p><strong>Description:</strong> {variant.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;
