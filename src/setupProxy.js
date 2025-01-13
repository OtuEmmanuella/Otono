// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/deezer',
    createProxyMiddleware({
      target: 'https://deezerdevs-deezer.p.rapidapi.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/deezer': '',
      },
      headers: {
        'x-rapidapi-key': 'e6c4deb059msh5b86828f7621de6p12127fjsn9ac9aafa782d',
        'x-rapidapi-host': 'deezerdevs-deezer.p.rapidapi.com',
      },
    })
  );
};