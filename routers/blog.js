const Routers = require("express").Router();
const blogController = require("../controllers/blog")

Routers.get("/:slug", blogController.oneBlogPublic)

module.exports = Routers
