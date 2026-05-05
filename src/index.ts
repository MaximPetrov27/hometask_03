import dotenv from "dotenv";

dotenv.config();

import express from "express";
import {
  closeMongo,
  connectMongo,
  ensureIndexes,
  setDatabaseName,
} from "./db/mongo";
import { setupApp } from "./setup-app";

const app = express();
setupApp(app);

export { app };
export default app;

const PORT = Number(process.env.PORT) || 5001;

async function start(): Promise<void> {
  const uri =
    process.env.MONGO_URL ??
    process.env.MONGO_MONGODB_URI ??
    process.env.MONGODB_URI ??
    "mongodb://127.0.0.1:27017";
  if (process.env.MONGO_DB_NAME) {
    setDatabaseName(process.env.MONGO_DB_NAME);
  }
  await connectMongo(uri);
  await ensureIndexes();
}

if (require.main === module) {
  start()
    .then(() => {
      app.listen(PORT, () => {
        const url = `http://localhost:${PORT}`;
        console.log(`Server is running on port ${PORT}`);
        console.log(url);
      });
    })
    .catch((err: unknown) => {
      console.error(err);
      process.exit(1);
    });

  process.on("SIGINT", async () => {
    await closeMongo();
    process.exit(0);
  });
}
