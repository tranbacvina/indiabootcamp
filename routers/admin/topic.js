const Routers = require("express").Router();
const course = require("../../controllers/course")

Routers.get('/:slug', course.allCourseTopic)


module.exports = Routers;
