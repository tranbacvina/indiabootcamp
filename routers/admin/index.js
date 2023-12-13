const Routers = require("express").Router();
const course = require("./course")
const order = require("./order")
const orderitem = require("./orderitem")
const bank = require("./bank")
const topic = require("./topic")
const blog = require("./blog");
const categories = require("./categories");
const media = require("./media")
const auth = require("../../middleware/auth")

Routers.get("/", (req, res) => { res.redirect("/admin/order") })
Routers.use("/course", course)
Routers.use("/order",auth.checkiSMasterAdmin, order)
Routers.use("/orderitem", orderitem)
Routers.use("/bank", bank)
Routers.use("/topic", topic)
Routers.use("/blogs", blog)
Routers.use("/categories", categories)
Routers.use("/media", media)






module.exports = Routers;
