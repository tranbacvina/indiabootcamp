const Routers = require("express").Router();
const course = require("./course")
const order = require("./order")
const orderitem = require("./orderitem")
const bank = require("./bank")
const topic = require("./topic")
const blog = require("./blog")

Routers.get("/", (req, res) => { res.redirect("/admin/order") })
Routers.use("/course", course)
Routers.use("/order", order)
Routers.use("/orderitem", orderitem)
Routers.use("/bank", bank)
Routers.use("/topic", topic)
Routers.use("/blogs", blog)






module.exports = Routers;
