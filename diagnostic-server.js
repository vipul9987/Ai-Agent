// Simple diagnostic server
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Log all environment variables (except sensitive ones)
console.log('Environment variables:');
Object.keys(process.env).forEach(key => {
  if (!key.includes('KEY') && !key.includes('SECRET') && !key.includes('TOKEN')) {
    console.log(`${key}: ${process.env[key]}`);
  } else {
    console.log(`${key}: [REDACTED]`);
  }
});

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  next();
});

// Parse JSON
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Diagnostic Server</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          .endpoint { margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
          .method { font-weight: bold; color: #0066cc; }
          button { padding: 8px 16px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; }
        </style>
      </head>
      <body>
        <h1>Diagnostic Server</h1>
        <p>Server is running on port ${PORT}</p>
        
        <div class="endpoint">
          <p><span class="method">GET</span> /api/health</p>
          <button onclick="fetch('/api/health').then(r => r.json()).then(data => alert(JSON.stringify(data)))">Test</button>
        </div>
        
        <div class="endpoint">
          <p><span class="method">POST</span> /generate-meta</p>
          <button onclick="fetch('/generate-meta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: 'https://example.com', keywords: 'test', variantCount: 1 })
          }).then(r => r.json()).then(data => {
            document.getElementById('legacy-result').textContent = JSON.stringify(data, null, 2);
          }).catch(err => {
            document.getElementById('legacy-result').textContent = 'Error: ' + err.message;
          })">Test</button>
          <pre id="legacy-result">Results will appear here</pre>
        </div>
        
        <div class="endpoint">
          <p><span class="method">POST</span> /api/generate-meta</p>
          <button onclick="fetch('/api/generate-meta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: 'https://example.com', keywords: 'test', variantCount: 1 })
          }).then(r => r.json()).then(data => {
            document.getElementById('api-result').textContent = JSON.stringify(data, null, 2);
          }).catch(err => {
            document.getElementById('api-result').textContent = 'Error: ' + err.message;
          })">Test</button>
          <pre id="api-result">Results will appear here</pre>
        </div>
        
        <div class="endpoint">
          <p><span class="method">GET</span> /debug/routes</p>
          <button onclick="fetch('/debug/routes').then(r => r.text()).then(data => {
            document.getElementById('routes-result').textContent = data;
          })">Show Routes</button>
          <pre id="routes-result">Routes will appear here</pre>
        </div>
      </body>
    </html>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Diagnostic server is running' });
});

// Legacy endpoint
app.post('/generate-meta', (req, res) => {
  console.log('Legacy endpoint called with body:', req.body);
  res.json({
    metaContent: [
      {
        title: `${req.body.keywords || 'keywords'} - Diagnostic Title`,
        description: `This is a test description for ${req.body.url || 'url'}`
      }
    ],
    url: req.body.url,
    keywords: req.body.keywords,
    variantCount: req.body.variantCount
  });
});

// New endpoint
app.post('/api/generate-meta', (req, res) => {
  console.log('New endpoint called with body:', req.body);
  res.json({
    metaContent: [
      {
        title: `${req.body.keywords || 'keywords'} - Diagnostic Title (API)`,
        description: `This is a test description for ${req.body.url || 'url'} (API endpoint)`
      }
    ],
    url: req.body.url,
    keywords: req.body.keywords,
    variantCount: req.body.variantCount
  });
});

// Debug endpoint to show all routes
app.get('/debug/routes', (req, res) => {
  const routes = [];
  
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      // Routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods).join(', ').toUpperCase()
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods).join(', ').toUpperCase()
          });
        }
      });
    }
  });
  
  res.send(`
    <h2>Registered Routes:</h2>
    <pre>${JSON.stringify(routes, null, 2)}</pre>
    
    <h2>Full Middleware Stack:</h2>
    <pre>${app._router.stack.map(m => m.name || 'unnamed').join('\n')}</pre>
  `);
});

// Catch-all handler
app.use((req, res) => {
  res.status(404).send(`
    <h1>404 - Not Found</h1>
    <p>The requested URL ${req.url} was not found on this server.</p>
    <p><a href="/">Go to diagnostic homepage</a></p>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`Diagnostic server running on port ${PORT}`);
});
