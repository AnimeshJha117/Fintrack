import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.js"],
    fileParallelism: false,
    env: {
      NODE_ENV: "test",
      CLIENT_URL: "http://localhost:5173",
      MONGODB_URI: "mongodb://localhost:27017/test",
      JWT_ACCESS_SECRET: "test-access-secret-0123456789abcdef",
      JWT_REFRESH_SECRET: "test-refresh-secret-0123456789abcdef",
    },
  },
});
