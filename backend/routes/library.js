"use strict";

/** Routes for library. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureAdmin, ensureLoggedIn } = require("../middleware/auth");
const Library = require("../models/library");
const axios = require("axios");
const libraryNewSchema = require("../schemas/libraryNew.json");
const libraryUpdateSchema = require("../schemas/libraryUpdate.json");
const librarySearchSchema = require("../schemas/librarySearch.json");
const url = "https://api.openopus.org";
const router = new express.Router();


/** POST / { library } =>  { library }
 *
 * Work should be { title, composer, genre, birth, epoch, popular }
 *
 * Returns { id, title, composer, genre, birth, epoch, popular }
 *
 * Authorization required: logged in
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, libraryNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const work = await Library.create(req.body);
    return res.status(201).json({ work });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { library: [ { id, title, composer, genre, birth, epoch, popular }, ...] }
 *
 * Can filter on provided search filters:
 * - composer (will find case-insensitive, partial matches)
 * - title (will find case-insensitive, partial matches)
 * - genre (will find case-insensitive, partial matches)
 * - popular
 * - epoch (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const q = req.query;
  let outsideResults = [];
  if (!q.genre && !q.popular && !q.epoch) {
    if (q.composer && !q.title) {
      const composerWorks = axios.get(`${url}/omnisearch/${q.composer}/0.json`);
      for (entry of composerWorks.results) {
        outsideResults.push({id: entry.work.id, title: entry.work.title, composer: entry.composer.complete_name, genre: entry.work.genre, birth: entry.composer.birth, epoch: entry.composer.epoch, popular: null});
      }
    } else if (q.title && !q.composer) {
      const composerWorks = axios.get(`${url}/omnisearch/${q.title}/0.json`);
      for (entry of composerWorks.results) {
        outsideResults.push({id: entry.work.id, title: entry.work.title, composer: entry.composer.complete_name, genre: entry.work.genre, birth: entry.composer.birth, epoch: entry.composer.epoch, popular: null});
      }
    } else if (q.title && q.composer) {
      const composerWorks = axios.get(`${url}/omnisearch/${q.title}%20${q.composer}/0.json`);
      for (entry of composerWorks.results) {
        outsideResults.push({id: entry.work.id, title: entry.work.title, composer: entry.composer.complete_name, genre: entry.work.genre, birth: entry.composer.birth, epoch: entry.composer.epoch, popular: null});
      }
    }
  }

  try {
    const validator = jsonschema.validate(q, librarySearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const library = await Library.findAll(q);
    if (outsideResults) {
      for (work of outsideResults) {
        library.push(work);
      }
    }
   
    return res.json({ library });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  =>  { work }
 *
 *  Work is { id, title, composer, genre, birth, popular, epoch }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const work = await Library.get(req.params.id);
    return res.json({ work });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] { fld1, fld2, ... } => { work }
 *
 * Patches work data.
 *
 * fields can be: { title, composer, genre, birth, popular, epoch }
 *
 * Returns { id, title, composer, genre, birth, popular, epoch }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, libraryUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const work = await Library.update(req.params.id, req.body);
    return res.json({ work });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Library.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
