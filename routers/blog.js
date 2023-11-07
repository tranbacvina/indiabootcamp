const Routers = require("express").Router();
const blogController = require("../controllers/blog")

Routers.get("/", blogController.allBlogPublic)

module.exports = Routers
