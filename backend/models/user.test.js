"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const User = require("./user.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testWorksOwned,
  testUser,
  testLibrary,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** authenticate */

describe("authenticate", function () {
  test("works", async function () {
    const user = await User.authenticate("u1", "password1");
    expect(user).toEqual({
      id: testUser[0],
      username: "u1",
      name: "U1F",
      email: "u1@email.com",
      isAdmin: true,
    });
  });

  test("unauth if no such user", async function () {
    try {
      await User.authenticate("nope", "password");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth if wrong password", async function () {
    try {
      await User.authenticate("u1", "wrong");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

/************************************** register */

describe("register", function () {
  test("works", async function () {
    let user = await User.register({
      username: "new",
      name: "Test",
      email: "test@test.com",
      isAdmin: false,
      password: "password",
    });
    expect(user).toEqual({
      id: expect.any(Number),
      username: "new",
      name: "Test",
      email: "test@test.com",
      isAdmin: false,
    });
    const found = await db.query(`SELECT * FROM users WHERE username = 'new'`);
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(false);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("works: adds admin", async function () {
    let user = await User.register({
      username: "new",
      name: "Test",
      email: "test@test.com",
      password: "password",
      isAdmin: true,
    });
    expect(user).toEqual({
      id: expect.any(Number),
      username: "new",
      name: "Test",
      email: "test@test.com",
      isAdmin: true,
    });
    const found = await db.query(`SELECT * FROM users WHERE username = 'new'`);
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(true);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("bad request with dup data", async function () {
    try {
      await User.register({
        username: "new",
        name: "Test",
        email: "test@test.com",
        isAdmin: false,
        password: "password",
      });
      await User.register({
        username: "new",
        name: "Test",
        email: "test@test.com",
        isAdmin: false,
        password: "password",
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    const users = await User.findAll();
    expect(users).toEqual([
      {
        username: "u1",
        name: "U1F",
        email: "u1@email.com",
        isAdmin: true,
      },
      {
        username: "u2",
        name: "U2F",
        email: "u2@email.com",
        isAdmin: false,
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let user = await User.get("u1");
    expect(user).toEqual({
      id: testUser[0],
      username: "u1",
      name: "U1F",
      email: "u1@email.com",
      isAdmin: true,
      works: expect.any(Array),
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    name: "NewF",
    email: "new@email.com",
    is_admin: true,
  };

  test("works", async function () {
    let user = await User.update("u1", updateData);
    expect(user).toEqual({
      username: "u1",
      name: "NewF",
      email: "new@email.com",
      isAdmin: true,
    });
  });

  test("works: set password", async function () {
    let user = await User.update("u1", {
      password: "new",
    });
    expect(user).toEqual({
      username: "u1",
      name: "U1F",
      email: "u1@email.com",
      isAdmin: true,
    });
    const found = await db.query(`SELECT * FROM users WHERE username = 'u1'`);
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("not found if no such user", async function () {
    try {
      await User.update("nope", {
        name: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if no data", async function () {
    expect.assertions(1);
    try {
      await User.update("c1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await User.remove("u1");
    const res = await db.query(`SELECT * FROM users WHERE username='u1'`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such user", async function () {
    try {
      await User.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** addToUserLib */

describe("addToUserLib", function () {
  test("works", async function () {
    await User.addToUserLib(testUser[0], testLibrary[1]);

    const res = await db.query(
      `SELECT * FROM user_library WHERE library_id=$1`,
      [testLibrary[1]]
    );
    expect(res.rows).toEqual([
      {
        api_id: null,
        digital: false,
        id: expect.any(Number),
        library_id: testLibrary[1],
        loanedout: true,
        notes: "note2",
        owned: false,
        physical: true,
        played: false,
        user_id: testUser[1],
      },
      {
        api_id: null,
        digital: null,
        id: expect.any(Number),
        library_id: testLibrary[1],
        loanedout: null,
        notes: null,
        owned: null,
        physical: null,
        played: null,
        user_id: testUser[0],
      },
    ]);
  });

  test("not found if no such work", async function () {
    try {
      await User.addToUserLib(testUser[0], 0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("not found if no such user", async function () {
    try {
      await User.addToUserLib(0, testWorksOwned[0]);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
