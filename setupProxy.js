// setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/deezer',
    createProxyMiddleware({
      target: 'https://api.deezer.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/deezer': '/search'  // Rewrite to hit the correct Deezer endpoint
      },
      headers: {
        'Accept': 'application/json'
      }
    })
  );
};
