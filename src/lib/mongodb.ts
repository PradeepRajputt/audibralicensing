
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {}

if (!uri || typeof uri !== 'string' || !uri.startsWith('mongodb')) {
  throw new Error(
    'Invalid/Missing environment variable: "MONGODB_URI". It must be a valid MongoDB connection string starting with "mongodb://" or "mongodb+srv://"'
  )
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

let globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
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
