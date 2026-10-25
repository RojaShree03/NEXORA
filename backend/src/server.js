
import app from './app.js';
import { env } from './config/environment.js';
import {
  connectDatabase,
  disconnectDatabase,
} from './config/database.js';

let server;

async function startServer() {
  await connectDatabase();

  server = app.listen(env.PORT, () => {
    console.log(`NEXORA API running at http://localhost:${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down NEXORA...`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Shutdown failed:', error.message);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer().catch((error) => {
  console.error('Failed to start NEXORA:', error.message);
  process.exit(1);
});
