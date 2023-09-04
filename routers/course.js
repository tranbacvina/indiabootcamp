const Routers = require("express").Router();
const { check } = require('express-validator');
const course = require("../controllers/course")


Routers.post("/check", [
    check('email', 'Không được để trống email').not().isEmpty(),
    check('email', 'Vui lòng điền đúng định dạng email').isEmail()
], course.check);

module.exports = Routers