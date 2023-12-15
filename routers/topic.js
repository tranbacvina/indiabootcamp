const Routers = require("express").Router();
const topicController = require("../controllers/topic")
const middleware = require("../middleware/auth")

Routers.get("/v2/:slug",middleware.checkUser, topicController.topicSlugGetCoursesV2)

Routers.get("/:slug",middleware.checkUser, topicController.topicSlugGetCourses)

module.exports = Routers
