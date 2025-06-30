
import * as functions from "firebase-functions";
import next from "next";
import * as path from "path";
import { config } from 'dotenv';

// Load environment variables from the root .env file.
// This ensures that your secrets are available to the Next.js server running in the function.
const projectRoot = path.join(__dirname, "..", "..");
config({ path: path.join(projectRoot, '.env') });


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
  console.log("File: " + request.originalUrl); // to debug
  return app.prepare().then(() => handle(request, response));
});
