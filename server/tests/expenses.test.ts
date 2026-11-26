import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "../src/app.js";

async function GetToken(email = "a@example.com") 
{
    await request(app).post("/api/auth/register").send({ name: "Tester", email, password: "password123" });
    const res = await request(app).post("/api/auth/login").send({ email, password: "password123" });
    return res.body.AccessToken as string;
}

const expense = { amount: 25050, category: "Food", description: "Lunch" };

describe("expenses", () => {
    it("requires authentication", async () => {
        const res = await request(app).get("/api/expenses");
        expect(res.status).toBe(401);
    });

    it("creates and lists expenses", async () => {
        const token = await GetToken();
        const create = await request(app).post("/api/expenses").set("Authorization", `Bearer ${token}`).send(expense);
        expect(create.status).toBe(201);
        expect(create.body.amount).toBe(25050);

        const list = await request(app).get("/api/expenses").set("Authorization", `Bearer ${token}`);
        expect(list.body).toHaveLength(1);
    });

    it("rejects non-integer amounts", async () => {
        const token = await GetToken();
        const res = await request(app).post("/api/expenses").set("Authorization", `Bearer ${token}`).send({ ...expense, amount: 250.5 });
        expect(res.status).toBe(400);
    });

    it("hides one user's expenses from another user", async () => {
        const tokenA = await GetToken("a@example.com");
        const tokenB = await GetToken("b@example.com");
        const create = await request(app).post("/api/expenses").set("Authorization", `Bearer ${tokenA}`).send(expense);

        const res = await request(app).get(`/api/expenses/${create.body.id}`).set("Authorization", `Bearer ${tokenB}`);
        expect(res.status).toBe(404);
    });

    it("updates and deletes an expense", async () => {
        const token = await GetToken();
        const create = await request(app).post("/api/expenses").set("Authorization", `Bearer ${token}`).send(expense);

        const update = await request(app).patch(`/api/expenses/${create.body.id}`).set("Authorization", `Bearer ${token}`).send({ amount: 30000 });
        expect(update.body.amount).toBe(30000);
        expect(update.body.category).toBe("Food");

        const del = await request(app).delete(`/api/expenses/${create.body.id}`).set("Authorization", `Bearer ${token}`);
        expect(del.status).toBe(204);
    });
});

describe("expense filters", () => {
    it("filters by month and category", async () => {
        const token = await GetToken();
        const auth = { Authorization: `Bearer ${token}` };
        const add = (category: string, date: string) =>
        request(app).post("/api/expenses").set(auth).send({ amount: 1000, category, date });

        await add("Food", "2026-01-15");
        await add("Food", "2026-02-10");
        await add("Rent", "2026-02-01");

        const feb = await request(app).get("/api/expenses?month=2026-02").set(auth);
        expect(feb.body).toHaveLength(2);

        const febFood = await request(app)
        .get("/api/expenses?month=2026-02&category=Food")
        .set(auth);
        expect(febFood.body).toHaveLength(1);
    });

    it("rejects an invalid month", async () => {
        const token = await GetToken();
        const res = await request(app)
        .get("/api/expenses?month=2026-13")
        .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(400);
    });

    it("lists distinct categories", async () => {
        const token = await GetToken();
        const auth = { Authorization: `Bearer ${token}` };
        await request(app).post("/api/expenses").set(auth).send({ amount: 100, category: "Food" });
        await request(app).post("/api/expenses").set(auth).send({ amount: 100, category: "Food" });
        await request(app).post("/api/expenses").set(auth).send({ amount: 100, category: "Rent" });

        const res = await request(app).get("/api/expenses/categories").set(auth);
        expect(res.body).toEqual(["Food", "Rent"]);
    });
});