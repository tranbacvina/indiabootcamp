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
var path = require('path');
const { SitemapStream, streamToPromise } = require('sitemap')
const { createGzip } = require('zlib')
const { Readable } = require('stream')
const courseController = require("../controllers/course")

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
  res.render("landing_Page/landing");
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

let sitemap;
Routers.get('/sitemap.xml', function (req, res) {
  res.header('Content-Type', 'application/xml');
  res.header('Content-Encoding', 'gzip');
  // if we have a cached entry send it
  if (sitemap) {
    res.send(sitemap);
    return;
  }
  try {
    const smStream = new SitemapStream({ hostname: process.env.DOMAIN })
    const pipeline = smStream.pipe(createGzip())

    smStream.write({ url: '/',  changefreq: 'always', priority: 1 })
    smStream.write({ url: '/sitemaps/course.xml',  changefreq: 'daily',  priority: 0.85 })
    smStream.write({ url: '/sitemaps/blog.xml',changefreq: 'daily',  priority: 0.85})   
    streamToPromise(pipeline).then(sm => sitemap = sm)
    smStream.end()
    pipeline.pipe(res).on('error', (e) => {throw e})
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

Routers.get('/sitemaps/:sitemap', (req, res) => {
  const { sitemap } = req.params;
  console.log(sitemap)
  return res.sendFile(path.join(__dirname, '../sitemaps', sitemap));
});

Routers.get("/:slug", blogController.oneBlogPublic)


Routers.get('*', function (req, res) {
  res.render('layout/404')
});
module.exports = Routers;
