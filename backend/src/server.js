
import app from './app.js';
import { connectDatabase } from './config/database.js';

let databaseConnectionPromise;

async function initializeDatabase() {
  if (!databaseConnectionPromise) {
    databaseConnectionPromise = connectDatabase().catch((error) => {
      databaseConnectionPromise = null;
      throw error;
    });
  }

  return databaseConnectionPromise;
}

const serverlessHandler = async (req, res) => {
  try {
    await initializeDatabase();
    return app(req, res);
  } catch (error) {
    console.error('Backend initialization failed:', error.message);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Backend initialization failed.',
      });
    }
  }
};

export default serverlessHandler;
