// Wrapper script to ensure output is visible
console.log('=== Starting server wrapper ===');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV || 'not set');

try {
  console.log('Loading dist/server.js...');
  require('./dist/server.js');
  console.log('Server file loaded successfully');
} catch (error) {
  console.error('=== ERROR LOADING SERVER ===');
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  process.exit(1);
}

