import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
const PORT = process.env.PORT;
async function main() {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
main().catch((err) => {
  console.error("Failed to start server: ", err);
  process.exit(1);
});
