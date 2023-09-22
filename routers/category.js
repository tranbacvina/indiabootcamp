const Routers = require("express").Router();
const category = require("../controllers/categories")


Routers.get("/:slug", category.findAllBlogBySlugcatgories)

module.exports = Routers