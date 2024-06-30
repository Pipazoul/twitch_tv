import { createServer } from '@triplit/server';
 
const port = 3000;

const startServer = createServer({
  storage: 'memory',
  verboseLogs: true,
});
 
const dbServer = startServer(port);
 
console.log('running on port', port);
process.on('SIGINT', function () {
  dbServer.close(() => {
    console.log('Shutting down server... ');
    process.exit();
  });
});