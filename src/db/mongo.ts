import { Collection, MongoClient } from "mongodb";
import type { BlogDocument, PostDocument } from "./documents";

const BLOGS = "blogs";
const POSTS = "posts";

let client: MongoClient | null = null;
let dbName = "blog_platform_ht03";

export function setDatabaseName(name: string): void {
  dbName = name;
}

export async function connectMongo(uri: string): Promise<void> {
  if (client) {
    return;
  }
  client = new MongoClient(uri);
  await client.connect();
}

let initPromise: Promise<void> | null = null;

function mongoUriFromEnv(): string {
  return (
    process.env.MONGO_URL ??
    process.env.MONGO_MONGODB_URI ??
    process.env.MONGODB_URI ??
    "mongodb://127.0.0.1:27017"
  );
}

/** Один раз подключает Mongo (для Vercel serverless, где нет вызова start() до запроса). */
export function ensureMongoReady(): Promise<void> {
  if (client) {
    return Promise.resolve();
  }
  if (!initPromise) {
    const p = (async () => {
      if (process.env.MONGO_DB_NAME) {
        setDatabaseName(process.env.MONGO_DB_NAME);
      }
      await connectMongo(mongoUriFromEnv());
      await ensureIndexes();
    })();
    initPromise = p.catch((err: unknown) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

export function getClient(): MongoClient {
  if (!client) {
    throw new Error("MongoDB client is not connected");
  }
  return client;
}

export function blogsCollection(): Collection<BlogDocument> {
  return getClient().db(dbName).collection<BlogDocument>(BLOGS);
}

export function postsCollection(): Collection<PostDocument> {
  return getClient().db(dbName).collection<PostDocument>(POSTS);
}

export async function clearAllCollections(): Promise<void> {
  await blogsCollection().deleteMany({});
  await postsCollection().deleteMany({});
}

export async function ensureIndexes(): Promise<void> {
  await blogsCollection().createIndex({ id: 1 }, { unique: true });
  await postsCollection().createIndex({ id: 1 }, { unique: true });
}

export async function closeMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
  }
}
