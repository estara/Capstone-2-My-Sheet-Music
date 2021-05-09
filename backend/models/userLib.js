"use strict";

const db = require("../db");
const { NotFoundError} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


/** Related functions for companies. */

class UserLibrary {
  /** Create a library selection (from data), update db, return new library selection data.
   *
   * data can be { user_id, library_id, api_id, owned, digital, physical, played, loanedout, notes }
   *
   * Returns { id, owned, digital, physical, played, loanedout, notes }
   **/

  static async create(data) {
    const result = await db.query(
          `INSERT INTO user_library (owned,
                             digital,
                             physical,
                             played,
                             loanedout,
                             notes,
                             api_id,
                             user_id,
                             library_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id, owned, digital, physical, played, loanedout, notes`,
        [
          data.owned,
          data.digital,
          data.physical,
          data.played,
          data.loanedout,
          data.notes,
          data.api_id,
          data.user_id,
          data.library_id
        ]);
    let item = result.rows[0];

    return item;
  }

  /** Find all library selections (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - owned
   * - digital
   * - physical
   * - played
   * - loanedout
   * - title (will find case-insensitive, partial matches)
   * - composer (will find case-insensitive, partial matches)
   *
   * Returns [{ id, owned, digital, physical, played, loanedout, notes, title, composer }, ...]
   * */

  static async findAll(user_id, { owned, digital, physical, played, loanedout, title, composer } = {}) {
    let query = `SELECT ul.id,
                        ul.digital,
                        ul.owned,
                        ul.physical,
                        ul.played,
                        ul.loanedout,
                        ul.notes,
                        l.title,
                        l.composer
                 FROM user_library ul 
                   LEFT JOIN library AS l ON l.id = ul.library_id `;

    let whereExpressions = [];
    let queryValues = [];

    // For each possible search term, add to whereExpressions and
    // queryValues so we can generate the right SQL

    if (owned && owned !== undefined) {
      whereExpressions.push(`ul.owned = true`);
    }

    if (digital && digital !== undefined) {
      whereExpressions.push(`ul.digital = true`);
    }

    if (physical && physical !== undefined) {
      whereExpressions.push(`ul.physical = true`);
    }

    if (played && played !== undefined) {
      whereExpressions.push(`ul.played = true`);
    }

    if (loanedout && loanedout !== undefined) {
      whereExpressions.push(`ul.loanedout = true`);
    }

    if (title && title !== undefined) {
      queryValues.push(`%${title}%`);
      whereExpressions.push(`l.title ILIKE $${queryValues.length}`);
    }

    if (composer) {
      queryValues.push(`%${composer}%`);
      whereExpressions.push(`l.composer ILIKE $${queryValues.length}`);
    }

    queryValues.push(`${user_id}`);
      whereExpressions.push(`ul.user_id = $${queryValues.length}`);

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }
    
  

    // Finalize query and return results

    query += " ORDER BY l.title";
    const itemsRes = await db.query(query, queryValues);
    return itemsRes.rows;
  }

  /** Given an item id, return data about item.
   *
   * Returns { id, owned, digital, physical, played, loanedout, notes, title, composer }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const itemRes = await db.query(
          `SELECT id,
                  library_id,
                  owned,
                  digital,
                  physical,
                  played,
                  loanedout,
                  notes
           FROM user_library
           WHERE id = $1`, [id]);

    const item = itemRes.rows[0];

    if (!item) throw new NotFoundError(`No item: ${id}`);

    const libraryRes = await db.query(
          `SELECT title,
                  composer
           FROM library
           WHERE id = $1`, [item.library_id]);

    delete item.library_id;
    item.title = libraryRes.rows[0].title;
    item.composer = libraryRes.rows[0].composer;

    return item;
  }

  /** Update user library data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { owned, digital, physical, played, loanedout, notes }
   *
   * Returns { id, owned, digital, physical, played, loanedout, notes }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE user_library 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                library_id,
                                owned, 
                                digital, 
                                physical,
                                played,
                                loanedout,
                                notes`;
    const result = await db.query(querySql, [...values, id]);
    const item = result.rows[0];

    if (!item) throw new NotFoundError(`No item: ${id}`);
    
    const libraryRes = await db.query(
      `SELECT title,
              composer
       FROM library
       WHERE id = $1`, [item.library_id]);

    delete item.library_id;
    item.title = libraryRes.rows[0].title;
    item.composer = libraryRes.rows[0].composer;

    return item;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM user_library
           WHERE id = $1
           RETURNING id`, [id]);
    const item = result.rows[0];

    if (!item) throw new NotFoundError(`No item: ${id}`);
  }
}

module.exports = UserLibrary;
