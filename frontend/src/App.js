import React, { useState } from "react";
import axios from "axios";

function App() {
    const [url, setUrl] = useState("");
    const [keywords, setKeywords] = useState("");
    const [variantCount, setVariantCount] = useState(1);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [storedData, setStoredData] = useState(null); // Store last request data for regeneration
    const [error, setError] = useState(null);
    const [copiedText, setCopiedText] = useState(null); // Track which text was copied

    // Function to copy text to clipboard
    const copyToClipboard = (text, type, index) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                setCopiedText(`${type}-${index}`);
                // Reset the copied text indicator after 2 seconds
                setTimeout(() => setCopiedText(null), 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                setError('Failed to copy to clipboard');
            });
    };

    const generateMeta = async (isRegenerate = false) => {
        setLoading(true);
        setResults([]);
        setError(null);
        setCopiedText(null);

        let requestData;
        if (isRegenerate && storedData) {
            requestData = storedData;
        } else {
            requestData = { url, keywords, variantCount };
            setStoredData(requestData);
        }

        // For local development: "http://localhost:5000/generate-meta"
        // For production with relative path: "/api/generate-meta"
        axios.post("/api/generate-meta", requestData, {
            headers: { "Content-Type": "application/json" }
        })
        .then(response => {
            console.log("Response Data:", response.data);

            if (Array.isArray(response.data.metaContent)) {
                setResults(response.data.metaContent);
            } else {
                console.error("Invalid format:", response.data);
                setError("Invalid response format from server");
                setResults([{ title: "Invalid Response", description: "Meta content format is incorrect." }]);
            }
        })
        .catch(error => {
            console.error("Axios Error:", error.response ? error.response.data : error.message);
            setError(error.response?.data?.error || "Server error. Please try again.");
            setResults([{ title: "Server Error", description: "Please try again." }]);
        })
        .finally(() => {
            setLoading(false);
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">
                            Meta Title & Description Generator
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Generate SEO-optimized meta titles and descriptions for your website
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-xl shadow-custom overflow-hidden">
                    {/* Form Section */}
                    <div className="p-6 sm:p-8">
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                                    Website URL
                                </label>
                                <input
                                    id="url"
                                    type="text"
                                    placeholder="https://example.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-150"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                                    Keywords (comma separated)
                                </label>
                                <input
                                    id="keywords"
                                    type="text"
                                    placeholder="seo, meta tags, website optimization"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-150"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="variantCount" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                                    Number of Variations
                                </label>
                                <input
                                    id="variantCount"
                                    type="number"
                                    placeholder="1-5"
                                    value={variantCount}
                                    onChange={(e) => setVariantCount(e.target.value)}
                                    min="1"
                                    max="5"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-150"
                                />
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <button
                                    onClick={() => generateMeta(false)}
                                    disabled={loading || !url || !keywords}
                                    className={`flex-1 px-6 py-3 text-base font-medium rounded-lg shadow-sm text-white ${loading || !url || !keywords ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'} transition duration-150 flex justify-center items-center`}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating...
                                        </>
                                    ) : "Generate Meta Content"}
                                </button>
                                <button
                                    onClick={() => generateMeta(true)}
                                    disabled={loading || !storedData}
                                    className={`flex-1 px-6 py-3 text-base font-medium rounded-lg shadow-sm ${loading || !storedData ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-primary-700 border border-primary-300 hover:bg-gray-50'} transition duration-150`}
                                >
                                    {loading && storedData ? "Regenerating..." : "Regenerate"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    {results.length > 0 && (
                        <div className="border-t border-gray-200 bg-gray-50 p-6 sm:p-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Generated Meta Content:</h3>
                            <div className="space-y-6">
                                {results.map((variant, index) => (
                                    <div key={index} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-medium text-gray-900">Variation {index + 1}</h4>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => copyToClipboard(`Title: ${variant.title}\n\nDescription: ${variant.description}`, 'all', index)}
                                                    className="text-xs flex items-center text-primary-600 hover:text-primary-800 transition-colors bg-primary-50 px-2 py-1 rounded-md"
                                                >
                                                    {copiedText === `all-${index}` ? (
                                                        <>
                                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                                            </svg>
                                                            Copied All
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                                                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                                                            </svg>
                                                            Copy All
                                                        </>
                                                    )}
                                                </button>
                                                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800">
                                                    {variant.title.length} chars
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-sm font-medium text-gray-500">Title:</p>
                                                <button
                                                    onClick={() => copyToClipboard(variant.title, 'title', index)}
                                                    className="text-xs flex items-center text-primary-600 hover:text-primary-800 transition-colors"
                                                >
                                                    {copiedText === `title-${index}` ? (
                                                        <>
                                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                                            </svg>
                                                            Copied!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                                                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                                                            </svg>
                                                            Copy
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <div className="group relative">
                                                <p className="text-base text-gray-900 border-l-4 border-primary-500 pl-3 py-1 pr-2">
                                                    {variant.title}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-sm font-medium text-gray-500">Description:</p>
                                                <button
                                                    onClick={() => copyToClipboard(variant.description, 'desc', index)}
                                                    className="text-xs flex items-center text-primary-600 hover:text-primary-800 transition-colors"
                                                >
                                                    {copiedText === `desc-${index}` ? (
                                                        <>
                                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                                            </svg>
                                                            Copied!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                                                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                                                            </svg>
                                                            Copy
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <div className="group relative">
                                                <p className="text-base text-gray-900 border-l-4 border-gray-300 pl-3 py-1 pr-2">
                                                    {variant.description}
                                                </p>
                                            </div>
                                            <div className="mt-2 text-right">
                                                <span className="text-xs text-gray-500">{variant.description.length} characters</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    Powered by Google Gemini AI
                </div>
            </div>
        </div>
    );
}

export default App;
