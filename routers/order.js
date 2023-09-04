const Routers = require("express").Router();
const { check } = require('express-validator');
const order = require("../controllers/order")


Routers.post("/createapi", [
    check('email', 'Không được để trống email').not().isEmpty(),
    check('email', 'Vui lòng điền đúng định dạng email').isEmail()
], order.createindia);
Routers.get("/", order.tracking)
Routers.post("/cstripe", order.cstripe)

Routers.get("/:uuid", order.getuuid)

module.exports = Routers