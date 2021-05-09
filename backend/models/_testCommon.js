const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config.js");

const testWorksOwned = [];
const testLibrary = [];
const testUser = [];

async function commonBeforeAll() {
  // make sure db is clear
  await db.query("DELETE FROM user_library")
  await db.query("DELETE FROM library");
  await db.query("DELETE FROM users");

  // add items to library
  const resultsLibrary = await db.query(`
    INSERT INTO library (title, composer, birth, genre, epoch, popular)
    VALUES ('w1', 'C1', '1000-01-01', 'Chant', 'Ancient', false),
           ('w2', 'C2', '2000-02-02', 'Symphony', 'Modern', false),
           ('w3', 'C3', '1930-03-03', 'Opera', 'Late Romantic', true),
           ('w4', 'C3', '1930-03-03', 'Keyboard', '20th Century', true)
           RETURNING id`);
           testLibrary.splice(0, 0, ...resultsLibrary.rows.map(r => r.id));
  
  // add users
  const userResults = await db.query(`
        INSERT INTO users (username,
                          hashed_password,
                          name,
                          email,
                          is_admin)
        VALUES ('u1', $1, 'U1F', 'u1@email.com', true),
               ('u2', $2, 'U2F', 'u2@email.com', false)
        RETURNING id`,
      [
        await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
        await bcrypt.hash("password2", BCRYPT_WORK_FACTOR)
      ]);
      testUser.splice(0, 0, ...userResults.rows.map(r => r.id));
      

  // add works to user's library
  const resultsOwned = await db.query(`
    INSERT INTO user_library (owned,
      digital,
      physical,
      played,
      loanedout,
      notes,
      api_id,
      user_id,
      library_id)
    VALUES (true, true, false, true, false, 'note1', null, ${testUser[0]}, ${testLibrary[0]}),
           (false, false, true, false, true, 'note2', null, ${testUser[1]}, ${testLibrary[1]}),
           (true, true, true, true, false, null, null, ${testUser[0]}, ${testLibrary[2]}),
           (false, false, false, true, false, 'note4', null, ${testUser[1]}, ${testLibrary[3]})
    RETURNING id`);
  testWorksOwned.splice(0, 0, ...resultsOwned.rows.map(r => r.id));

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


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testWorksOwned,
  testLibrary,
  testUser
};