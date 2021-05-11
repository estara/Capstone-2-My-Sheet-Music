"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Library = require("./library.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testLibrary
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newWork = {
    title: "new",
    composer: "New",
    birth: "1900-01-01",
    genre: "Chamber",
    epoch: "Romantic",
    popular: true
  };

  test("works", async function () {
    let work = await Library.create(newWork);
    expect(work).toEqual({id: expect.any(Number), ...newWork});

    const result = await db.query(
          `SELECT title, composer, birth, genre, epoch, popular
           FROM library
           WHERE title = 'new'`);
    expect(result.rows).toEqual([
      {
        title: "new",
        composer: "New",
        birth: "1900-01-01",
        genre: "Chamber",
        epoch: "Romantic",
        popular: true
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Library.create(newWork);
      await Library.create(newWork);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: all", async function () {
    let works = await Library.findAll();
    expect(works).toEqual([
      {id: expect.any(Number), title: 'w1', composer: 'C1', birth: '1000-01-01', genre: 'Chant', epoch: 'Ancient', popular: false},
      {id: expect.any(Number), title: 'w2', composer: 'C2', birth: '2000-02-02', genre: 'Symphony', epoch: 'Modern', popular: false},
      {id: expect.any(Number), title: 'w3', composer: 'C3', birth: '1930-03-03', genre: 'Opera', epoch: 'Late Romantic', popular: true},
      {id: expect.any(Number), title: 'w4', composer: 'C3', birth: '1930-03-03', genre: 'Keyboard', epoch: '20th Century', popular: true}
    ]);
  });

  test("works: by popular", async function () {
    let works = await Library.findAll({ popular: true });
    expect(works).toEqual([
      {id: expect.any(Number), title: 'w3', composer: 'C3', birth: '1930-03-03', genre: 'Opera', epoch: 'Late Romantic', popular: true},
      {id: expect.any(Number), title: 'w4', composer: 'C3', birth: '1930-03-03', genre: 'Keyboard', epoch: '20th Century', popular: true},
    ]);
  });

  test("works: by genre", async function () {
    let works = await Library.findAll({ genre: "Opera" });
    expect(works).toEqual([
      {id: expect.any(Number), title: 'w3', composer: 'C3', birth: '1930-03-03', genre: 'Opera', epoch: 'Late Romantic', popular: true}
    ]);
  });

  test("works: by composer", async function () {
    let works = await Library.findAll({ title: "1" });
    expect(works).toEqual([
      {id: expect.any(Number), title: 'w1', composer: 'C1', birth: '1000-01-01', genre: 'Chant', epoch: 'Ancient', popular: false}
    ]);
  });

  test("works: by composer", async function () {
    let works = await Library.findAll({ composer: "1" });
    expect(works).toEqual([
      {id: expect.any(Number), title: 'w1', composer: 'C1', birth: '1000-01-01', genre: 'Chant', epoch: 'Ancient', popular: false}
    ]);
  });

  test("works: empty list on nothing found", async function () {
    let works = await Library.findAll({ composer: "nope" });
    expect(works).toEqual([]);
  });

});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let work = await Library.get(testLibrary[0]);
    expect(work).toEqual({title: 'w1', composer: 'C1', birth: '1000-01-01', genre: 'Chant', epoch: 'Ancient'}
    );
  });

  test("not found if no such work", async function () {
    try {
      await Library.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {title: 'new1', composer: 'newC1', birth: '1010-01-01', genre: 'Bad Chant', epoch: 'Newer Ancient', popular: true};

  test("works", async function () {
    let work = await Library.update(testLibrary[0], updateData);
    expect(work).toEqual({
      ...updateData,
    });

    const result = await db.query(
          `SELECT title, composer, birth, genre, epoch, popular
           FROM library
           WHERE id = ${testLibrary[0]}`);
    expect(result.rows).toEqual([{title: 'new1', composer: 'newC1', birth: '1010-01-01', genre: 'Bad Chant', epoch: 'Newer Ancient', popular: true}]);
  });

  test("not found if no such work", async function () {
    try {
      await Library.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Library.update(testLibrary[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    const res = await Library.remove(testLibrary[0]);
    expect(res).toEqual({id: testLibrary[0]});
    const res2 = await db.query(
        `SELECT id FROM library WHERE id = ${testLibrary[0]}`);
    expect(res2).toEqual(`No local work: ${testLibrary[0]}`);
  });

  test("not found if no such work", async function () {
    try {
      await Library.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
