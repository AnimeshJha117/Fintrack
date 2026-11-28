import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "../src/app.js";
const user = { name: "Test", email: "test@example.com", password: "password123" };
describe("POST /api/auth/register", () => {
  it("creates a user without exposing the password hash", async () => {
    const res = await request(app).post("/api/auth/register").send(user);
    expect(res.status).toBe(201);
    expect(res.body.email).toBe(user.email);
    expect(res.body.passwordhash).toBeUndefined();
  });
  it("rejects a duplicate email", async () => {
    await request(app).post("/api/auth/register").send(user);
    const res = await request(app).post("/api/auth/register").send(user);
    expect(res.status).toBe(409);
  });
  it("rejects a short password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...user, password: "short" });
    expect(res.status).toBe(400);
  });
});
describe("login and protected routes", () => {
  it("logs in, sets a refresh cookie and allows access to /me", async () => {
    await request(app).post("/api/auth/register").send(user);
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    expect(login.status).toBe(200);
    expect(login.body.RefreshToken).toBeTruthy();
    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${login.body.AccessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.email).toBe(user.email);
  });
  it("rejects a wrong password", async () => {
    await request(app).post("/api/auth/register").send(user);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "wrongpassword" });
    expect(res.status).toBe(401);
  });
  it("blocks /me without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
