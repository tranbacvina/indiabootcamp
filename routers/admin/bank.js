const Routers = require("express").Router();
const vietcombank = require("../../controllers/vietcombank")
const momo = require("../../controllers/momo")


Routers.get("/vietcombank", vietcombank.vietcombankApi)
Routers.get("/momo", momo.getLSGD2)
Routers.get("/momo/detail", momo.getdetailTransaction)
Routers.get("/momo/settings", momo.index);
Routers.post("/momo/settings/momo/opt", momo.momo_send_opt);
Routers.post("/momo/settings/momo/very-opt", momo.momo_very_opt);
Routers.post("/momo/settings/momo/login", momo.momo_login);


module.exports = Routers;
