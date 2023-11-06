const app = require("express")()

const Routers = require("express").Router();
const course = require("./course")
const order = require("./order")
const topic = require("./topic")
const auth = require("../controllers/auth")
const middleware = require('../middleware/auth')
const admin = require("./admin")
const category = require("./category")
const blogController = require("../controllers/blog")
const IP = require('ip');
// Routers.use("*", middleware.checkUser)
const db = require("../models");
const blog = require('./blog')

Routers.get("/", (req, res) => {
  res.render("landing_Page/landing");
});

Routers.use("/course", course)
Routers.use("/blog", blog)
Routers.use("/topic", topic)
Routers.use("/order", order)
Routers.get("/login", auth.getLogin)

Routers.post("/login", auth.login)
Routers.post("/adduser", auth.adduser)
Routers.use("/admin", middleware.needLogin, admin)

Routers.use("/category", category)
Routers.get("/myip", (req, res) => {
  const ipAddress = IP.address();
  const client_user_agent = req.useragent.source
  const fbc = req.cookies._fbc
  const fbp = req.cookies._fbp
  res.send({ ipAddress, client_user_agent, fbc, fbp })
})
Routers.get("/:slug", blogController.oneBlogPublic)








Routers.get('*', function (req, res) {
  res.render('layout/404')
});
module.exports = Routers;
