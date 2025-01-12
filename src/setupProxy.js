// setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/deezer',
    createProxyMiddleware({
      target: 'https://api.deezer.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/deezer': '' // Remove /api/deezer prefix
      },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0' // Some APIs require a user agent
      },
      onProxyReq: (proxyReq) => {
        // Add any required query parameters
        proxyReq.path += proxyReq.path.includes('?') ? '&' : '?';
        proxyReq.path += 'output=json';
      },
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({ error: 'Proxy Error', details: err.message }));
      }
    })
  );
};