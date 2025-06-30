
import * as functions from "firebase-functions";
import next from "next";
import * as path from "path";
import { config } from 'dotenv';

// Load environment variables from .env file in the project root
// The path is relative to the compiled 'lib' folder in the functions directory
config({ path: path.join(__dirname, "..", "..", ".env") });

const dev = process.env.NODE_ENV !== "production";

// The Next.js app is located at the root, so we point the project root there.
const app = next({
  dev,
  conf: {
    distDir: path.join(__dirname, "..", "..", ".next"),
  },
});

const handle = app.getRequestHandler();

export const nextServer = functions.https.onRequest((request, response) => {
  // log the page.js file path
  // This is a temporary log for debugging purposes.
  console.log("File: " + request.originalUrl);
  return app.prepare().then(() => handle(request, response));
});
