import dotenv from "dotenv";

dotenv.config();

import express from "express";
import { closeMongo, ensureMongoReady } from "./db/mongo";
import { setupApp } from "./setup-app";

const app = express();
setupApp(app);

export { app };
export default app;

const PORT = Number(process.env.PORT) || 5001;

async function start(): Promise<void> {
  await ensureMongoReady();
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
