
import * as functions from "firebase-functions";
import next from "next";
import * as path from "path";

const dev = process.env.NODE_ENV !== "production";

// The Next.js app is located at the root, so we point the project root there.
const app = next({
  dev,
  conf: {
    distDir: path.join(".next"),
  },
});

const handle = app.getRequestHandler();

export const nextServer = functions.https.onRequest((request, response) => {
  console.log("File: " + request.originalUrl); // to debug
  return app.prepare().then(() => handle(request, response));
});
