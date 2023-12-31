const Routers = require("express").Router();
const course = require("./course")
const order = require("./order")
const auth = require("../controllers/auth")
const middleware = require('../middleware/auth')
const admin = require("./admin")

// Routers.use("*", middleware.checkUser)


Routers.get("/", (req, res) => {
  res.render("landing_Page/landing");
});

Routers.use("/course", course)
Routers.use("/order", order)
Routers.post("/login", auth.login)
Routers.post("/adduser", auth.adduser)
Routers.use("/admin", admin)


Routers.get('*', function (req, res) {
  res.render('layout/404')
});
module.exports = Routers;
