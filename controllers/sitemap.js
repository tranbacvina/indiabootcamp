var path = require('path');
const { SitemapStream, streamToPromise } = require('sitemap')
const { createGzip } = require('zlib')
const { Readable } = require('stream')
const fs = require('fs');
let sitemap;

const mainSitemap = (req, res) => {
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
      smStream.write({ url: '/sitemaps/topic.xml',changefreq: 'daily',  priority: 0.85})   
      streamToPromise(pipeline).then(sm => sitemap = sm)
      smStream.end()
      pipeline.pipe(res).on('error', (e) => {throw e})
    } catch (e) {
      console.error(e);
      res.status(500).end();
    }
}

const fileSitemap = (req, res) => {
    const { sitemap } = req.params;
    if (!fs.existsSync(path.join(__dirname, '../sitemaps', sitemap))) {
        res.status(404).render('layout/404')
    }
  return res.sendFile(path.join(__dirname, '../sitemaps', sitemap));
}
module.exports ={mainSitemap,fileSitemap}