"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testLibraryIds,
  u1Token,
  u2Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /library */

describe("POST /library", function () {
  const newWork = {
    title: "new",
    composer: "newC",
    genre: "Opera",
    birth: "1900-01-01",
    epoch: "Late Romantic",
    popular: false
  };

  test("ok for admin", async function () {
    const resp = await request(app)
        .post("/library")
        .send(newWork)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({work: {
      id: expect.any(Number),
      ...newWork
    }});
  });

  test("ok for non-admin", async function () {
    const resp = await request(app)
        .post("/library")
        .send(newWork)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({ work: {
      id: expect.any(Number),
      ...newWork
    }});
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/library")
        .send({
          title: "new",
          popular: true,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/library")
        .send({
          title: "new",
          composer: "newC",
          genre: "Opera",
          birth: "1900-01-01",
          epoch: "Late Romantic",
          popular: "not-a-bool",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /library */

describe("GET /library", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/library");
    expect(resp.body).toEqual({
      library:
          [
            {
              id: testLibraryIds[0],
              title: "w1",
              composer: "C1",
              genre: "Chant",
              birth: "1000-01-01",
              epoch: "Ancient",
              popular: false
            },
          {
            id: testLibraryIds[1],
            title: "w2",
            composer: "C2",
            genre: "Symphony",
            birth: "2000-02-02",
            epoch: "Modern",
            popular: false
          },
          {
            id: testLibraryIds[2],
            title: "w3",
            composer: "C3",
            genre: "Opera",
            birth: "1930-03-03",
            epoch: "Late Romantic",
            popular: true
          },
          {
            id: testLibraryIds[3],
            title: "w4",
            composer: "C3",
            genre: "Keyboard",
            birth: "1930-03-03",
            epoch: "20th Century",
            popular: true
        }
          ],
    });
  });

  test("works: filtering", async function () {
    const resp = await request(app)
        .get("/library")
        .query({ epoch: "Late Romantic" });
    expect(resp.body).toEqual({
      library: [
        {
          id: testLibraryIds[2],
          title: "w3",
          composer: "C3",
          genre: "Opera",
          birth: "1930-03-03",
          epoch: "Late Romantic",
          popular: true
        },
      ],
    });
  });

  test("works: filtering on multiple filters", async function () {
    const resp = await request(app)
        .get("/library")
        .query({ title: "1", composer: "1", genre: "Chant", epoch: "Ancient" });
    expect(resp.body).toEqual({
      library: [
        {
          id: testLibraryIds[0],
          title: "w1",
          composer: "C1",
          genre: "Chant",
          birth: "1000-01-01",
          epoch: "Ancient",
          popular: false
        },
      ],
    });
  });

  test("bad request if invalid filter key", async function () {
    const resp = await request(app)
        .get("/library")
        .query({ nope: "nope" });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /library/:id */

describe("GET /library/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/library/${testLibraryIds[0]}`);
    expect(resp.body).toEqual({ work: 
        {
          title: "w1",
          composer: "C1",
          genre: "Chant",
          birth: "1000-01-01",
          epoch: "Ancient"
        },
    });
  });

  test("works for admin", async function () {
    const resp = await request(app).get(`/library/${testLibraryIds[0]}`)
    .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ work: 
        {
          title: "w1",
          composer: "C1",
          genre: "Chant",
          birth: "1000-01-01",
          epoch: "Ancient"
        },
    });
  });

  test("not found for no such work", async function () {
    const resp = await request(app).get(`/library/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /library/:id */

describe("PATCH /library/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/library/${testLibraryIds[0]}`)
        .send({
          genre: "C1-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ work: {
      title: "w1",
      composer: "C1",
      genre: "C1-new",
      birth: "1000-01-01",
      epoch: "Ancient",
      popular: false
    },});
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
        .patch(`/library/${testLibraryIds[0]}`)
        .send({
          genre: "C1-new",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/library/${testLibraryIds[0]}`)
        .send({
          genre: "C1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such work", async function () {
    const resp = await request(app)
        .patch(`/library/0`)
        .send({
          genre: "new nope",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
        .patch(`/library/${testLibraryIds[0]}`)
        .send({
          id: "c1-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/library/${testLibraryIds[0]}`)
        .send({
          popular: "not-a-bool",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /library/:id */

describe("DELETE /library/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/library/${testLibraryIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: `${testLibraryIds[0]}` });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
        .delete(`/library/${testLibraryIds[0]}`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/library/${testLibraryIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such work", async function () {
    const resp = await request(app)
        .delete(`/library/0`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
