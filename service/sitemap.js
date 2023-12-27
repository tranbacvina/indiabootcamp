const { /* createReadStream, */ createWriteStream } = require('fs');
const { resolve } = require('path');
const { createGzip } = require('zlib');
const {
  SitemapAndIndexStream,
  SitemapStream,
  // lineSeparatedURLsToSitemapOptions,
} = require('sitemap');
const db = require('../models')
const { Op } = require("sequelize");

const DOMAIN = process.env.DOMAIN


const courseSitemap = async () => {
    const sms = new SitemapAndIndexStream({
        limit: 50000,
        getSitemapStream: (i) => {
          const sitemapStream = new SitemapStream({
            hostname: 'https://fullbootcamp.com',
          });
          const path = `./sitemaps/course_${i}.xml`;
      
          const ws = createWriteStream(resolve(path));
          sitemapStream
            .pipe(ws); // write it to sitemap-NUMBER.xml
      
          return [
            new URL(path, `https://fullbootcamp.com/`).toString(),
            sitemapStream,
            ws,
          ];
        },
      });
      
      
      sms
        .pipe(createWriteStream(resolve('./sitemaps/course.xml')));
      
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
        const path = `./sitemaps/blog_${i}.xml`;
    
        const ws = createWriteStream(resolve(path));
        sitemapStream
          .pipe(ws); // write it to sitemap-NUMBER.xml
    
        return [
          new URL(path, `https://fullbootcamp.com/`).toString(),
          sitemapStream,
          ws,
        ];
      },
    });
    
    
    sms
      .pipe(createWriteStream(resolve('./sitemaps/blog.xml')));
    
  const courses = await db.Blog.findAll({where: {
    isDeleted: false
  }})

    const arrayOfSitemapItems = courses.map( item => {
      return { url: `/${item.slug}`, changefreq: 'daily' }
    })
      

    arrayOfSitemapItems.forEach((item) => sms.write(item));
    sms.end();
}

const topicSitemap = async () => {
  const sms = new SitemapAndIndexStream({
      limit: 50000,
      getSitemapStream: (i) => {
        const sitemapStream = new SitemapStream({
          hostname: 'https://fullbootcamp.com',
        });
        const path = `./sitemaps/topic_${i}.xml`;
    
        const ws = createWriteStream(resolve(path));
        sitemapStream
          .pipe(ws); // write it to sitemap-NUMBER.xml
    
        return [
          new URL(path, `https://fullbootcamp.com/`).toString(),
          sitemapStream,
          ws,
        ];
      },
    });
    
    
    sms
      .pipe(createWriteStream(resolve('./sitemaps/topic.xml')));
    
  const courses = await db.Topic.findAll()

    const arrayOfSitemapItems = courses.map( item => {
      return { url: `/${item.slug}`, changefreq: 'daily' }
    })
      

    arrayOfSitemapItems.forEach((item) => sms.write(item));
    sms.end();
}

const rss = async () => {
  const blog = await db.Blog.findAll({
    limit: 10,
    order:['id', 'DESC']
   })

   const course = await db.course.findAll({
    limit: 30,
    order: ['id', 'DESC'],
    where:{
      TopicId: {
        [Op.not]: null
      }
    }
   })


    const feed = new Feed({
      title: "Full Bootcamp",
      description: "Khoá Học Udemy - Unica - Gitiho 50k - Chia sẻ khoá học miễn phí Online",
      id: DOMAIN,
      link: DOMAIN,
      language: "vi", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
      image: "https://fullbootcamp.com/img/redketchup/favicon-32x32.png",
      favicon: "https://fullbootcamp.com/img/redketchup/favicon-32x32.png",
     
      author: {
        name: "Full Bootcamp",
        email: "fullbootcamp@gmail.com",
        link: DOMAIN
      }
    });

    blog.forEach(post => {
      feed.addItem({
        title: post.title,
        id: `${DOMAIN}/${post.slug}`,
        link: `${DOMAIN}/${post.slug}`,
        description: post.description,
        content: post.content,
        author: [
          {
            name: "Full Bootcamp",
            email: "fullbootcamp@gmail.com",
            link: DOMAIN
          },
         
        ],
     
        date: post.createdAt,
        image: `https://fullbootcamp.com${post.thumbnail}`
      });
    });

    course.forEach(post => {
      feed.addItem({
        title: post.name,
        id: `${DOMAIN}/${post.slug}`,
        link: `${DOMAIN}/${post.slug}`,
        description: post.description,
        content: post.description_log,
        author: [
          {
            name: "Full Bootcamp",
            email: "fullbootcamp@gmail.com",
            link: DOMAIN
          },
         
        ],
     
        date: post.createdAt,
        image: `https://fullbootcamp.com${post.thumbnail}`
      });
    });

    const path = `./sitemaps/rss.xml`;
    const rss2 = feed.rss2()
  // Write the RSS XML content to the file
  writeFile(path, rss2)
    .then(() => {
      console.log(`RSS feed generated and saved to ${path}`);
    })
    .catch((err) => {
      console.error('Error writing RSS feed:', err);
    });
}
module.exports = {courseSitemap,blogSitemap,topicSitemap}