const Routers = require("express").Router();
const commentsController = require("../controllers/comments")

Routers.post("/course/:courseid", commentsController.addCommentsToCourse)

module.exports = Routers
