const Routers = require("express").Router();
const { check } = require('express-validator');
const course = require("../controllers/course")

Routers.get("/", course.publicall)
Routers.get("/:id", course.onePublic)

Routers.post("/check", [
    check('email', 'Email cannot be left blank.').not().isEmpty(),
    check('email', 'Please enter a valid email format.').isEmail()
], course.check);

module.exports = Routers