import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "../src/app.js";
describe("error handling", () => {
  it("returns JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Route not found");
  });
  it("returns 400 for malformed JSON", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{ bad json");
    expect(res.status).toBe(400);
  });
});
