const request = require("supertest");
const { app } = require("../app");

describe("AI API", () => {
  it("400 on empty prompt", async () => {
    const res = await request(app).post("/api/ai").send({ prompt: "" });
    expect(res.status).toBe(400);
    expect(res.body?.error?.code).toBe("BAD_REQUEST");
  });

  it("health ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
