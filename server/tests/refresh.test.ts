import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "../src/app.js";

const user = { name: "Test", email: "test@example.com", password: "password123" };

async function login() 
{
    await request(app).post("/api/auth/register").send(user);
    const res = await request(app)
        .post("/api/auth/login")
        .send({ email: user.email, password: user.password });
    return res.body as { AccessToken: string; RefreshToken: string };
}

describe("refresh tokens", () => {
    it("rotates the refresh token", async () => {
        const { RefreshToken } = await login();
        const res = await request(app).post("/api/auth/refresh").send({ RefreshToken });

        expect(res.status).toBe(200);
        expect(res.body.AccessToken).toBeTruthy();
        expect(res.body.RefreshToken).not.toBe(RefreshToken);
    });

    it("rejects a reused token and revokes the whole session", async () => {
        const { RefreshToken } = await login();
        const first = await request(app).post("/api/auth/refresh").send({ RefreshToken });
        const reuse = await request(app).post("/api/auth/refresh").send({ RefreshToken });
        expect(reuse.status).toBe(401);

        const afterReuse = await request(app)
            .post("/api/auth/refresh")
            .send({ RefreshToken: first.body.RefreshToken });
        expect(afterReuse.status).toBe(401);
    });

    it("logout invalidates the refresh token", async () => {
        const { RefreshToken } = await login();
        const out = await request(app).post("/api/auth/logout").send({ RefreshToken });
        expect(out.status).toBe(204);

        const res = await request(app).post("/api/auth/refresh").send({ RefreshToken });
        expect(res.status).toBe(401);
    });
});