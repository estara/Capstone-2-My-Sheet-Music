"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, name, email, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
          `SELECT username,
                  hashed_password,
                  name,
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.hashed_password);
      if (isValid) {
        delete user.hashed_password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { id, username, name, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register(
      { username, password, name, email, isAdmin }) {
    const duplicateCheck = await db.query(
          `SELECT username
           FROM users
           WHERE username = $1`,
        [username],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
          `INSERT INTO users
           (username,
            hashed_password,
            name,
            email,
            is_admin)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, username, name, email, is_admin AS "isAdmin"`,
        [
          username,
          hashedPassword,
          name,
          email,
          isAdmin,
        ],
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ username, name, email, is_admin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
          `SELECT username,
                  name,
                  email,
                  is_admin AS "isAdmin"
           FROM users
           ORDER BY username`,
    );

    return result.rows;
  }

  /** Given a username, return data about user.
   *
   * Returns { id, username, name, is_admin, works }
   *   where works is { id, owned, played, digital, physical, notes, loanedout, title, composer }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const userRes = await db.query(
          `SELECT id,
                  username,
                  name,
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    const userLibRes = await db.query(
          `SELECT ul.id,
                  ul.api_id,
                  ul.owned,
                  ul.played,
                  ul.digital,
                  ul.physical,
                  ul.notes,
                  ul.loanedout,
                  l.title,
                  l.composer
           FROM user_library AS ul 
           LEFT JOIN library AS l
           ON ul.library_id = l.id
           WHERE ul.user_id = $1`, [user.id]);

    user.works = userLibRes.rows.map(ul => ul.id);
    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { name, password, email }
   *
   * Returns { username, name, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   */

  static async update(username, data) {
    if (data.hashed_password) {
      data.hashed_password = await bcrypt.hash(data.hashed_password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data, {});
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                name,
                                email,
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
          `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
        [username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }


  /** Add to user_lib: update db, returns undefined.
   *
   * - id: id of user adding to user_library
   * - workId: id of work
   **/

  static async addToUserLib(id, workId) {
    const preCheck = await db.query(
          `SELECT id
           FROM user_library
           WHERE id = $1`, [workId]);
    const work = preCheck.rows[0];

    if (!work) throw new NotFoundError(`No work: ${workId}`);

    const preCheck2 = await db.query(
          `SELECT id
           FROM users
           WHERE id = $1`, [id]);
    const user = preCheck2.rows[0];

    if (!user) throw new NotFoundError(`No username: ${id}`);

    await db.query(
          `INSERT INTO user_library (library_id, user_id)
           VALUES ($1, $2)`,
        [workId, id]);
  }
}


module.exports = User;
