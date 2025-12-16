const localtunnel = require('localtunnel');

(async () => {
  // Try without custom subdomain to avoid IP restrictions
  const tunnel = await localtunnel({
    port: 3002,
    local_host: '127.0.0.1'
  });

  console.log('\n========================================');
  console.log('🚀 Bagsy Dashboard Tunnel Active!');
  console.log('========================================');
  console.log('URL:', tunnel.url);
  console.log('========================================\n');

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
