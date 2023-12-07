const express = require("express");
const app = express();
const port = 3020;
const cookieParser = require('cookie-parser')
const Routers = require("./routers");
const { sequelize } = require("./models");
const cors = require("cors");
var cron = require('node-cron');
const cronBank = require('./controllers/cron_bank')
const paginate = require('express-paginate');
const stripe = require("./service/stripe")
var useragent = require('express-useragent');
const urlService = require('./service/url')
app.use(useragent.express());
const sitemmapService = require('./service/sitemap')
// Middleware để xoá dấu '/' cuối cùng của mỗi URL
app.use((req, res, next) => {
  if (req.path[req.path.length - 1] === '/' && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  let canonicalURL = ''; 
    if (req.query.page == 1 || req.query.page == null) {
         canonicalURL = `https://${req.host}${req.path}`;
    } else {
        canonicalURL = urlService.getPageQuery(`https://${req.hostname}${req.originalUrl}`);
    }
  res.locals.canonicalURL = canonicalURL;
  next();
})

app.post("/webhookstripe", express.raw({ type: 'application/json' }), stripe.webhookStipe);


app.use(paginate.middleware(20, 56));
app.use(cookieParser())
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", "./views");
// Static Files

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/uploads'));

app.use(
  cors({
    origin: "*",
  })
);

app.use("/", Routers);



cron.schedule('* * * * *', async () => {
  await cronBank.cron()
});

cron.schedule('0 1 * * *', async () => {
  await sitemmapService.blogSitemap()
  await sitemmapService.courseSitemap()
  await sitemmapService.topicSitemap()
  
}, {
  scheduled: true,
  timezone: "Asia/Ho_Chi_Minh"
});

app.listen(port, async () => {
  console.log(`Server is online port Fullbootcamp.com http://localhost:${port}`);

  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
