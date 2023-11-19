const Routers = require("express").Router();
const { check } = require('express-validator');
const course = require("../controllers/course")
const middleware = require('../middleware/auth')


Routers.get("/", course.publicall)
Routers.get("/:slug",middleware.checkUser,course.onePublic)

Routers.post("/check", [
    check('email', 'Email cannot be left blank.').not().isEmpty(),
    check('email', 'Please enter a valid email format.').isEmail()
], course.check);

module.exports = Routers