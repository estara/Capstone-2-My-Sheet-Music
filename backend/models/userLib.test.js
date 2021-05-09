"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const UserLibrary = require("./userLib.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testWorksOwned,
  testLibrary,
  testUser
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  let newOwned = {
    user_id: testUser[0],
    library_id: testLibrary[0],
    owned: true,
    digital: false,
    physical: true,
    played: true,
    loanedout: false,
    notes: "note1"
  };

  test("works", async function () {
    let owned = await UserLibrary.create(newOwned);
    expect(owned).toEqual({
      ...newOwned,
      id: expect.any(Number),
    });
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let owned = await UserLibrary.findAll(testUser[0]);
    expect(owned).toEqual([
      {id: testWorksOwned[0], owned: true, digital: true, physical: false, played: true, loanedout: false, notes: "note1", title: "w1", composer: "C1"},
      {id: testWorksOwned[2], owned: true, digital: true, physical: true, played: true, loanedout: false, notes: null, title: "w3", composer: "C3"}
    ]);
  });

  test("works: by owned", async function () {
    let owned = await UserLibrary.findAll(testUser[0], { owned: true });
    expect(owned).toEqual([
      {id: testWorksOwned[0], owned: true, digital: true, physical: false, played: true, loanedout: false, notes: "note1", title: "w1", composer: "C1"},
      {id: testWorksOwned[2], owned: true, digital: true, physical: true, played: true, loanedout: false, notes: null, title: "w3", composer: "C3"}
    ]);
  });

  test("works: by digital", async function () {
    let owned = await UserLibrary.findAll(testUser[0], { digital: true });
    expect(owned).toEqual([
      {id: testWorksOwned[0], owned: true, digital: true, physical: false, played: true, loanedout: false, notes: "note1", title: "w1", composer: "C1"},
      {id: testWorksOwned[2], owned: true, digital: true, physical: true, played: true, loanedout: false, notes: null, title: "w3", composer: "C3"}
    ]);
  });

  test("works: by played & physical", async function () {
    let owned = await UserLibrary.findAll(testUser[0], { played: true, physical: true });
    expect(owned).toEqual([
      {id: testWorksOwned[2], owned: true, digital: true, physical: true, played: true, loanedout: false, notes: null, title: "w3", composer: "C3"},
    ]);
  });

  test("works: by title", async function () {
    let owned = await UserLibrary.findAll(testUser[0], { title: "w1" });
    expect(owned).toEqual([
      {id: testWorksOwned[0], owned: true, digital: true, physical: false, played: true, loanedout: false, notes: "note1", title: "w1", composer: "C1"},
    ]);
  });

  test("works: by composer", async function () {
    let owned = await UserLibrary.findAll(testUser[0], { composer: "C3"});
    expect(owned).toEqual([
      {id: testWorksOwned[2], owned: true, digital: true, physical: true, played: true, loanedout: false, notes: null, title: "w3", composer: "C3"}
    ])
  })

  test("works: by title, loanedout & physical", async function () {
    let owned = await UserLibrary.findAll(testUser[1], {title: "w2", loanedout: true, physical: true});
    expect(owned).toEqual([
      {id: testWorksOwned[1], owned: false, digital: false, physical: true, played: false, loanedout: true, notes: "note2", title: "w2", composer: "C2"}
    ])
  })
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let owned = await UserLibrary.get(testWorksOwned[0]);
    expect(owned).toEqual({id: testWorksOwned[0], owned: true, digital: true, physical: false, played: true, loanedout: false, notes: "note1", title: "w1", composer: "C1"},
    );
  });

  test("not found if no such work", async function () {
    try {
      await UserLibrary.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  let updateData = {owned: true, digital: true, physical: true, played: true, loanedout: true, notes: "newnote"};
  test("works", async function () {
    let owned = await UserLibrary.update(testWorksOwned[3], updateData);
    expect(owned).toEqual({
      id: testWorksOwned[3],
      title: "w4",
      composer: "C3",
      ...updateData,
    });
  });

  test("not found if no such work", async function () {
    try {
      await UserLibrary.update(0, {
        notes: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await UserLibrary.update(testWorksOwned[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await UserLibrary.remove(testWorksOwned[0]);
    const res = await db.query(
        "SELECT id FROM user_library WHERE id=$1", [testWorksOwned[0]]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await UserLibrary.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
