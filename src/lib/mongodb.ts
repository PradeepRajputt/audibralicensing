
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI;

// For debugging: log the URI to confirm it's loaded from .env
console.log("MongoDB Connection URI:", uri ? `Loaded (ending with ...${uri.slice(-10)})` : "NOT FOUND");


if (!uri) {
  // This error will be thrown if the MONGODB_URI is not set in your .env file
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }
  
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise
