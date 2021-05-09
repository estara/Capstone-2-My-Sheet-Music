"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testWorksOwnedIds,
  testLibraryIds,
  testUserIds,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /userLib */

describe("POST /userLib", function () {
  test("ok for admin", async function () {
    const resp = await request(app)
        .post(`/userLib`)
        .send({ owned: false, digital: false, physical: true, played: false, loanedout: true, notes: "note1", api_id: null, library_id: testLibraryIds[0], user_id: testUserIds[2]})
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({work: {id: expect.any(Number), owned: false, digital: false, physical: true, played: false, loanedout: true, notes: "note1"},});
  });

  test("auth for users", async function () {
    const resp = await request(app)
        .post(`/userLib`)
        .send({ owned: false, digital: false, physical: true, played: false, loanedout: true, notes: "note1", api_id: null, library_id: testLibraryIds[0], user_id: testUserIds[2]})
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({ owned: false, digital: false, physical: true, played: false, loanedout: true, notes: "note1"});
  });

  test("unath for anon", async function () {
    const resp = await request(app)
        .post(`/userLib`)
        .send({ owned: false, digital: false, physical: true, played: false, loanedout: true, notes: "note1", api_id: null, library_id: testLibraryIds[0], user_id: testUserIds[2]});
    expect(resp.statusCode).toEqual(401);
  })

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post(`/userLib`)
        .send({
          notes: "c1",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post(`/userLib`)
        .send({ owned: "foo", digital: "bar", physical: true, played: false, loanedout: true, notes: "note1", api_id: null, library_id: testLibraryIds[0], user_id: testUserIds[2]})
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

});

/************************************** GET /userLib/user/:id */

describe("GET /userLib/user/:id", function () {
  test("ok for admin", async function () {
    const resp = await request(app).get(`/userLib/user/${testUserIds[1]}`)
    .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
          library: [
            { id: expect.any(Number), owned: true, digital: true, physical: true, played: true, loanedout: false, notes: null, title: "w1", composer: "C1" }
          ],
        },
    );
  });

  test("ok for correct user", async function () {
    const resp = await request(app).get(`/userLib/user/${testUserIds[1]}`)
    .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
          library: [
            { owned: true, digital: true, physical: true, played: true, loanedout: false, notes: null, title: "w1", composer: "C1" },
            { owned: null, digital: null, physical: null, played: null, loanedout: null, notes: null, title: "w2", composer: "C2" },
          ],
        },
    );
  });

  test("works: filtering", async function () {
    const resp = await request(app)
        .get(`/userLib/user/${testUserIds[1]}`)
        .query({ owned: true })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
          library: [
            {id: expect.any(Number), owned: true, digital: true, physical: true, played: true, loanedout: false, notes: null, title: "w1", composer: "C1" }
          ],
        },
    );
  });

  test("works: filtering on 2 filters", async function () {
    const resp = await request(app)
      .get(`/userLib/user/${testUserIds[1]}`)
      .query({ physical: true, digital: true })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      library: [
        {id: expect.any(Number), owned: true, digital: true, physical: true, played: true, loanedout: false, notes: null, title: "w1", composer: "C1" }
      ],
        },
    );
  });

  test("bad request on invalid filter key", async function () {
    const resp = await request(app)
        .get(`/userLib/user/${testUserIds[1]}`)
        .query({ nope: "nope" })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unath for anon", async function () {
    const resp = await request(app)
        .get(`/userLib/user/${testUserIds[1]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unath for wrong user", async function () {
    const resp = await request(app)
        .get(`/userLib/user/${testUserIds[0]}`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /userLib/:id */

describe("GET /userLib/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app).get(`/userLib/${testWorksOwnedIds[0]}`)
    .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({work: {id: testWorksOwnedIds[0], owned: false, digital: false, physical: true, played: false, loanedout: true, notes: "note1", title: "w4", composer: "C3"},});
  });

  test("works for correct user", async function () {
    const resp = await request(app).get(`/userLib/${testWorksOwnedIds[1]}`)
    .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({work: {id: testWorksOwnedIds[1], owned: true, digital: true, physical: true, played: true, loanedout: false, notes: null,  title: "w1", composer: "C1"},});
  });

  test("unath for anon", async function () {
    const resp = await request(app)
        .get(`/userLib/${testUserIds[1]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/userLib/0`)
    .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /userLib/:id */

describe("PATCH /userLib/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/userLib/${testWorksOwnedIds[0]}`)
        .send({
          owned: true,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({work: { id: testWorksOwnedIds[0], owned: true, digital: false, physical: true, played: false, loanedout: true, notes: "note1", title: "w4", composer: "C3"},});
  });

  test("works for correct user", async function () {
    const resp = await request(app).patch(`/userLib/${testWorksOwnedIds[1]}`)
    .send({
      loanedout: true,
    })
    .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({ id: testWorksOwnedIds[1], owned: true, digital: true, physical: true, played: true, loanedout: false, notes: null, title: "w1", composer: "C1" });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
        .patch(`/userLib/${testWorksOwnedIds[0]}`)
        .send({
          owned: true,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such work", async function () {
    const resp = await request(app)
        .patch(`/userLib/0`)
        .send({
          notes: "new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
        .patch(`/userLib/${testWorksOwnedIds[0]}`)
        .send({
          id: "new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .patch(`/userLib/${testWorksOwnedIds[0]}`)
        .send({
          owned: "not-a-bool",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /userLib/:id */

describe("DELETE /userLib/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/userLib/${testWorksOwnedIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: testWorksOwnedIds[0] });
  });

  test("works for correct user", async function () {
    const resp = await request(app)
        .delete(`/userLib/${testWorksOwnedIds[1]}`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({ deleted: testWorksOwnedIds[1] });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
        .delete(`/userLib/${testWorksOwnedIds[0]}`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/userLib/${testWorksOwnedIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such work", async function () {
    const resp = await request(app)
        .delete(`/userLib/0`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
