const Routers = require("express").Router();
const topicController = require("../controllers/topic")

Routers.get("/:slug", topicController.topicSlugGetCourses)

module.exports = Routers
