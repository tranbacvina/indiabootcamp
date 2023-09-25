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
var sitemap = require('express-sitemap');

// Routers.use("*", middleware.checkUser)
const db = require("../models");


Routers.get("/", (req, res) => {
  res.render("landing_Page/landing");
});

Routers.use("/course", course)
Routers.use("/topic", topic)
Routers.use("/order", order)
Routers.get("/login", auth.getLogin)

Routers.post("/login", auth.login)
Routers.post("/adduser", auth.adduser)
Routers.use("/admin", middleware.needLogin, admin)

Routers.use("/category", category)
Routers.get("/:slug", blogController.oneBlogPublic)





const map = sitemap({
  url: 'https://fullbootcamp.com',
  map: {
    '/topic/lap-trinh': ['get'],
    '/category/huong-dan': ['get'],
    '/category/share-khoa-hoc-0': ['get'],

  },
  route: { // specific option for some route

    '/admin': {
      disallow: true, // write this route to robots.txt
    },
    '/order': {
      disallow: true,
    }
  },
})

Routers.get('/sitemap.xml', function (req, res) { // send XML map

  res.send(map.XMLtoWeb(res));
})

Routers.get('/robots.txt', function (req, res) { // send TXT map

  map.TXTtoWeb(res);
});
Routers.get('*', function (req, res) {
  res.render('layout/404')
});
module.exports = Routers;
