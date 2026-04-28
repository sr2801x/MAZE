const http = require("http");
const dotenv = require("dotenv");
const path = require("path");

// Load `server/.env` explicitly (more reliable on Windows / different cwd).
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const { createApp } = require("./app");
const { connectDb } = require("./config/db");
const { logger } = require("./utils/logger");

async function main() {
  await connectDb(process.env.MONGODB_URI);

  const app = await createApp();
  const server = http.createServer(app);

  const port = Number(process.env.PORT || 8080);
  server.listen(port, () => {
    logger.info(`MAZE server listening on :${port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

