const localtunnel = require('localtunnel');

(async () => {
  const tunnel = await localtunnel({ port: 3002, subdomain: 'bagsy-dashboard' });

  console.log('Tunnel URL:', tunnel.url);

  tunnel.on('close', () => {
    console.log('Tunnel closed');
    process.exit(1);
  });

  tunnel.on('error', (err) => {
    console.error('Tunnel error:', err);
  });

  // Keep the process alive
  setInterval(() => {}, 1000);
})();
