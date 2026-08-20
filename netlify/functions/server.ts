import serverless from 'serverless-http';
import { app } from '../../server';
import { db } from '../../src/db';

let isInitialized = false;

const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  // Prevent AWS Lambda / Netlify from freezing process before background async resolves
  context.callbackWaitsForEmptyEventLoop = false;

  if (!isInitialized) {
    try {
      await db.init();
      isInitialized = true;
    } catch (err) {
      console.warn('DB initialization error during Netlify cold start:', err);
    }
  }

  return serverlessHandler(event, context);
};
