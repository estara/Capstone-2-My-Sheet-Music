"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Library = require("../models/library");
const UserLibrary = require("../models/userLib");
const { createToken } = require("../helpers/tokens");

let testLibraryIds = [];
let testWorksOwnedIds = [];
let testUserIds = [];

async function commonBeforeAll() {
  await db.query("DELETE FROM user_library");
  await db.query("DELETE FROM library");
  await db.query("DELETE FROM users");

  // add items to library
  testLibraryIds[0] = (
    await Library.create({
      title: "w1",
      composer: "C1",
      genre: "Chant",
      birth: "1000-01-01",
      epoch: "Ancient",
      popular: false,
    })
  ).id;
  testLibraryIds[1] = (
    await Library.create({
      title: "w2",
      composer: "C2",
      genre: "Symphony",
      birth: "2000-02-02",
      epoch: "Modern",
      popular: false,
    })
  ).id;
  testLibraryIds[2] = (
    await Library.create({
      title: "w3",
      composer: "C3",
      genre: "Opera",
      birth: "1930-03-03",
      epoch: "Late Romantic",
      popular: true,
    })
  ).id;
  testLibraryIds[3] = (
    await Library.create({
      title: "w4",
      composer: "C3",
      genre: "Keyboard",
      birth: "1930-03-03",
      epoch: "20th Century",
      popular: true,
    })
  ).id;

  // add users
  testUserIds[0] = (
    await User.register({
      username: "u1",
      name: "U1",
      email: "user1@user.com",
      password: "password1",
      isAdmin: true,
    })
  ).id;
  testUserIds[1] = (
    await User.register({
      username: "u2",
      name: "U2",
      email: "user2@user.com",
      password: "password2",
      isAdmin: false,
    })
  ).id;
  testUserIds[2] = (
    await User.register({
      username: "u3",
      name: "U3",
      email: "user3@user.com",
      password: "password3",
      isAdmin: false,
    })
  ).id;

  // add details to user's works
  testWorksOwnedIds[0] = (
    await UserLibrary.create({
      owned: false,
      digital: false,
      physical: true,
      played: false,
      loanedout: true,
      notes: "note1",
      api_id: null,
      library_id: testLibraryIds[3],
      user_id: testUserIds[0],
    })
  ).id;
  testWorksOwnedIds[1] = (
    await UserLibrary.create({
      owned: true,
      digital: true,
      physical: true,
      played: true,
      loanedout: false,
      notes: null,
      api_id: null,
      library_id: testLibraryIds[0],
      user_id: testUserIds[1],
    })
  ).id;
  testWorksOwnedIds[2] = (
    await UserLibrary.create({
      owned: false,
      digital: false,
      physical: false,
      played: true,
      loanedout: false,
      notes: "note4",
      api_id: null,
      library_id: testLibraryIds[3],
      user_id: testUserIds[2],
    })
  ).id;
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const u1Token = createToken({
  id: testUserIds[0],
  username: "u1",
  isAdmin: true,
});
const u2Token = createToken({
  id: testUserIds[1],
  username: "u2",
  isAdmin: false,
});

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testWorksOwnedIds,
  testLibraryIds,
  testUserIds,
  u1Token,
  u2Token,
};
