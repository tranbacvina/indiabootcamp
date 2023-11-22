const { /* createReadStream, */ createWriteStream } = require('fs');
const { resolve } = require('path');
const { createGzip } = require('zlib');
const {
  SitemapAndIndexStream,
  SitemapStream,
  // lineSeparatedURLsToSitemapOptions,
} = require('sitemap');
const db = require('../models')
const courseSitemap = async () => {
    const sms = new SitemapAndIndexStream({
        limit: 50000,
        getSitemapStream: (i) => {
          const sitemapStream = new SitemapStream({
            hostname: 'https://fullbootcamp.com',
          });
          const path = `../sitemaps/course_${i}.xml`;
      
          const ws = createWriteStream(resolve(path));
          sitemapStream
            .pipe(ws); // write it to sitemap-NUMBER.xml
      
          return [
            new URL(path, `https://fullbootcamp.com/sitemaps/`).toString(),
            sitemapStream,
            ws,
          ];
        },
      });
      
      
      sms
        .pipe(createWriteStream(resolve('../sitemaps/course.xml')));
      
    const courses = await db.course.findAll()

      const arrayOfSitemapItems = courses.map( item => {
        return { url: `/course/${item.slug}`, changefreq: 'daily' }
      })
        

      arrayOfSitemapItems.forEach((item) => sms.write(item));
      sms.end();
}

const blogSitemap = async () => {
  const sms = new SitemapAndIndexStream({
      limit: 50000,
      getSitemapStream: (i) => {
        const sitemapStream = new SitemapStream({
          hostname: 'https://fullbootcamp.com',
        });
        const path = `../sitemaps/blog_${i}.xml`;
    
        const ws = createWriteStream(resolve(path));
        sitemapStream
          .pipe(ws); // write it to sitemap-NUMBER.xml
    
        return [
          new URL(path, `https://fullbootcamp.com/sitemaps/`).toString(),
          sitemapStream,
          ws,
        ];
      },
    });
    
    
    sms
      .pipe(createWriteStream(resolve('../sitemaps/blog.xml')));
    
  const courses = await db.Blog.findAll()

    const arrayOfSitemapItems = courses.map( item => {
      return { url: `/${item.slug}`, changefreq: 'daily' }
    })
      

    arrayOfSitemapItems.forEach((item) => sms.write(item));
    sms.end();
}
module.exports = {courseSitemap,blogSitemap}