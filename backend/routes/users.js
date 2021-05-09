"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");
const axios = require("axios");
const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");
const { assertExpressionStatement } = require("@babel/types");
const url = "https://api.openopus.org"

const router = express.Router();


/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { id, username, name, email, isAdmin }, token }
 *
 * Authorization required: admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});


/** GET / => { users: [ {username, name, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});


/** GET /[username] => { user }
 *
 * Returns { id, username, name, isAdmin, works }
 *   where works is [{ id, api_id, owned, played, digital, physical, notes, loanedout, title, composer }...]
 *
 * Authorization required: correct user or admin
 **/

router.get("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    for (work of user.works) {
      if (api_id !== null) {
        const outsideWork = await axios.get(`${url}/work/detail/${api_id}.json`);
        work.title = outsideWork.work.title;
        work.composer = outsideWork.composer.complete_name;
      }
    }
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { name, password, email }
 *
 * Returns { username, name, email, isAdmin }
 *
 * Authorization required: correct user or admin
 **/

router.patch("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: correct user or admin
 **/

router.delete("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});


/** POST /[username]/jobs/[id]  { state } => { application }
 *
 * Returns {"added": workId}
 *
 * Authorization required: correct user or admin
 * */

router.post("/:username/userLib/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
  try {
    const workId = +req.params.id;
    await User.addToUserLib(req.params.username, workId);
    return res.json({ added: workId });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
