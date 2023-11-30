const app = require("express")()
const Routers = require("express").Router();
const course = require("./course")
const order = require("./order")
const topic = require("./topic")
const auth = require("../controllers/auth")
const middleware = require('../middleware/auth')
const admin = require("./admin")
const category = require("./category")
const comments = require("./comments")
const blogController = require("../controllers/blog")
const IP = require('ip');
// Routers.use("*", middleware.checkUser)
const blog = require('./blog')
const schema = require("../service/schema")

const courseController = require("../controllers/course")
const sitemapController = require("../controllers/sitemap")

Routers.use((req, res, next) => {
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  
  const currentDate = new Date();
  const currentMonth = months[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  
  const formattedDate = `${currentMonth}/${currentYear}`;
  
  res.locals.formattedDate = formattedDate
  next();
});

Routers.get("/", (req, res) => {
  const schemaHome = schema.home()
  res.render("landing_Page/landing",{schemaHome});
});

Routers.use("/course", course)
Routers.use("/tim-kiem", courseController.timKiemPage)
Routers.use("/comments", comments)
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

Routers.get('/sitemap.xml', sitemapController.mainSitemap);

Routers.get('/sitemaps/:sitemap', sitemapController.fileSitemap);
Routers.get("/lienhe", blogController.lienhe)
Routers.get("/gioi-thieu", blogController.gioithieu)
Routers.get("/chinh-sach-bao-mat", blogController.chinhsachbaomat)

Routers.get("/:slug", blogController.oneBlogPublic)


Routers.get('*', function (req, res) {
  res.status(404).render('layout/404')
});
module.exports = Routers;
