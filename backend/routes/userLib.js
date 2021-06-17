"use strict";

/** Routes for userLib. */

const jsonschema = require("jsonschema");
const axios = require("axios");
const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin, ensureCorrectUserOrAdmin } = require("../middleware/auth");
const UserLibrary = require("../models/userLib");
const userLibNewSchema = require("../schemas/userLibNew.json");
const userLibUpdateSchema = require("../schemas/userLibUpdate.json");
const userLibSearchSchema = require("../schemas/userLibSearch.json");
const url = "https://api.openopus.org";
const router = express.Router({ mergeParams: true });

/** POST / { work } => { work }
 *
 * data can be { user_id, library_id, api_id, owned, digital, physical, played, loanedout, notes }
 *
 * Returns { id, owned, digital, physical, played, loanedout, notes }
 *
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userLibNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const work = await UserLibrary.create(req.body);
    return res.status(201).json({ work });
  } catch (err) {
    return next(err);
  }
});

/** GET /user/:id =>
 *      [{ id, owned, digital, physical, played, loanedout, notes, title, composer }, ...]
 *
 * searchFilters (all optional):
   * - owned
   * - digital
   * - physical
   * - played
   * - loanedout
   * - title (will find case-insensitive, partial matches)
   * - composer (will find case-insensitive, partial matches)

 * Authorization required: correct user or admin
 */

router.get(
  "/user/:id",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    const q = req.query;

    try {
      const validator = jsonschema.validate(q, userLibSearchSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const library = await UserLibrary.findAll(req.params.id, q);

      for (let work of library) {
        if (work.api_id !== null) {
          const apiWork = await axios.get(
            `${url}/work/detail/${work.api_id}.json`
          );
          work.title = apiWork.data.work.title;
          work.composer = apiWork.data.composer.complete_name;
        }
      }

      return res.json({ library });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET /[workId] => { work }
 *
 * Returns { id, owned, digital, physical, played, loanedout, notes, title, composer }
 *
 * Authorization required: correct user or admin
 */

router.get(
  "/:workId",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const work = await UserLibrary.get(+req.params.workId);
      if (work.title === null) {
        const apiWork = await axios.get(`${url}/work/detail/${work.id}.json`);
        work.title = apiWork.work.title;
        work.composer = apiWork.composer.complete_name;
      }
      return res.json({ work });
    } catch (err) {
      return next(err);
    }
  }
);

/** PATCH /[workId]  { fld1, fld2, ... } => { work }
 *
 * Data can include: { owned, digital, physical, played, loanedout, notes }
 *
 * Returns { id, owned, digital, physical, played, loanedout, notes }
 *
 * Authorization required: correct user or admin
 */

router.patch(
  "/:id/:workId",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      for (let field in req.body) {
        if (req.body[field] === "on") {
          req.body[field] = true;
        }
      }

      const validator = jsonschema.validate(req.body, userLibUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const work = await UserLibrary.update(+req.params.workId, req.body);
      return res.json({ work });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[workId]  =>  { deleted: id }
 *
 * Authorization required: correct user or admin
 */

router.delete(
  "/:id/:workId",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      await UserLibrary.remove(+req.params.workId);
      return res.json({ deleted: +req.params.workId });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
