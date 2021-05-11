"use strict";

const db = require("../db");
const axios = require("axios");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");
const url = "https://api.openopus.org";

/** Related functions for library. */

class Library {
  /** Create a work (from data), update db, return new work data.
   *
   * data should be { title, composer, birth, genre, epoch, popular }
   *
   * Returns { id, title, composer, birth, genre, epoch, popular }
   *
   * Throws BadRequestError if work already in database.
   * */

  static async create({ title, composer, birth, genre, epoch, popular }) {
    const duplicateCheck = await db.query(
          `SELECT title,
                  composer
           FROM library
           WHERE title = $1 AND composer = $2`,
        [title, composer]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate work: ${title}`);

    const result = await db.query(
          `INSERT INTO library
           (title, composer, birth, genre, epoch, popular)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, title, composer, birth, genre, epoch, popular`,
        [
          title,
          composer,
          birth,
          genre,
          epoch,
          popular,
        ],
    );
    const work = result.rows[0];

    return work;
  }

  /** Find all works (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - title (will find case-insensitive, partial matches)
   * - genre
   * - popular
   * - composer (will find case-insensitive, partial matches)
   * - epoch (will find case-insensitive, partial matches)
   *
   * Returns [{ id, title, composer, birth, genre, epoch, popular }, ...]
   * */

  static async findAll(searchFilters = {}) {
    let query = `SELECT id,
                        title,
                        composer,
                        genre,
                        epoch,
                        birth,
                        popular
                 FROM library`;
    let whereExpressions = [];
    let queryValues = [];

    const { title, composer, genre, popular, epoch } = searchFilters;

    // For each possible search term, add to whereExpressions and queryValues so
    // we can generate the right SQL

    if (popular) {
      queryValues.push(popular);
      whereExpressions.push(`popular = $${queryValues.length}`);
    }

    if (title) {
      queryValues.push(`%${title}%`);
      whereExpressions.push(`title ILIKE $${queryValues.length}`);
    }
    
    if (epoch) {
      queryValues.push(`%${epoch}%`);
      whereExpressions.push(`epoch ILIKE $${queryValues.length}`);
    }

    if (composer) {
      queryValues.push(`%${composer}%`);
      whereExpressions.push(`composer ILIKE $${queryValues.length}`);
    }

    if (genre) {
      queryValues.push(`%${genre}%`);
      whereExpressions.push(`genre ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Finalize query and return results

    query += " ORDER BY composer";
    const worksRes = await db.query(query, queryValues);
    return worksRes.rows;
  }

  /** Given an id, return data about work.
   *
   * Returns { title, composer, genre, epoch }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const workRes = await db.query(
          `SELECT title,
                  composer,
                  genre,
                  epoch,
                  birth
           FROM library
           WHERE id = $1`,
        [id]);

    let work = workRes.rows[0];
    
    if (!work) {
      try{
      const apiCheck = await axios.get(`${url}/work/detail/${id}.json`)
      if (!apiCheck) {throw new NotFoundError(`No work: ${id}`);}
      work = {title: apiCheck.work.title, composer: apiCheck.composer.complete_name, epoch: apiCheck.composer.epoch, birth: apiCheck.composer.birth}
      } catch (err) {}
    }
    if (!work) {throw new NotFoundError(`No work: ${id}`)}
    return work;
  }

  /** Update work data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, composer, genre, birth, epoch, popular}
   *
   * Returns {title, composer, genre, birth, epoch, popular}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE library 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING title, 
                                composer, 
                                genre, 
                                birth,
                                epoch,
                                popular`;
    const result = await db.query(querySql, [...values, id]);
    const work = result.rows[0];
    
    if (!work) throw new NotFoundError(`No local work: ${id}`);

    return work;
  }

  /** Delete given work from database; returns undefined.
   *
   * Throws NotFoundError if work not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM library
           WHERE id = $1
           RETURNING id`,
        [id]);
    const work = result.rows[0];

    if (!work) throw new NotFoundError(`No local work: ${id}`);
    return work
  }
}


module.exports = Library;
