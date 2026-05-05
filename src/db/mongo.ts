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
  client = new MongoClient(uri);
  await client.connect();
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
