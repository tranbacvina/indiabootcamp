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
var sitemap = require('express-sitemap');
var useragent = require('express-useragent');

app.use(useragent.express());
app.post("/webhookstripe", express.raw({ type: 'application/json' }), stripe.webhookStipe);


app.use(paginate.middleware(28, 20));
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


const map = sitemap({
  http: "https",
  url: "fullbootcamp.com",
  sitemap: './public/sitemap.xml',
  map: {
    '/topic/lap-trinh': ['get'],
    '/topic/hidden': ['get'],
    '/topic/cyberlearn': ['get'],
    '/topic/thiet-ke': ['get'],
    '/category/huong-dan': ['get'],
    '/category/share-khoa-hoc': ['get'],
  },

})
map.XMLtoFile();
app.listen(port, async () => {
  console.log(`Server is online port Fullbootcamp.com http://localhost:${port}`);
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
