const cawn_data = require("./service/cawn_data_test")
const db =require('./models')
const { Op } = require("sequelize");
const { includes, conforms } = require("lodash");
const axios = require('axios')
const cheerio = require("cheerio");
const Sequelize = require('sequelize');
const { gotScraping } = require('got-scraping');
require('dotenv').config()

const hand_coursetoTopics = async (links) => {
        const promises = []
        for (let link of links) {
        console.log(link.url)

            const regex = /(udemy.com|unica.vn|kt.city\/course|gitiho.com\/khoa-hoc)/g;
            const expression = link.url.match(regex);
            switch (expression[0]) {
                case "unica.vn":
                     await cawn_data.unica(link)
                    break;
                case "udemy.com":
                     await cawn_data.udemy(link)
                    break;
                case "gitiho.com/khoa-hoc":
                     await cawn_data.gitiho(link)
                    break;
                default:
                  console.log({ success: false, data: '', messenger: "Lỗi, Không hỗ trợ khoá học này" })
    
            }
        }
        // const result = await Promise.all(promises)
    
        // console.log(result)
}


const getAllCourses = async(label_id,topicId) => {
    const getCourse = await axios.get(`
    https://www.udemy.com/api-2.0/discovery-units/all_courses/?page_size=16&subs_coll_id=&subcategory=&instructional_level=&lang=&price=&duration=&closed_captions=&subs_filter_type=&label_id=${label_id}&source_page=topic_page&locale=vi_VN&currency=usd&skip_price=true&sos=pl&fl=lbl`)
    
    let links = []
    for (let course of getCourse.data.unit.items) {
        console.log(course.title, course.url)
        const url = `https://www.udemy.com${course.url}`
        links= [...links,{uri:url, topicId}]
    }
    return links
}    
const getdiscovery_context = async(label_id,topicId) => {
    let links = []
    try {
        const started = await axios.get(`
        https://www.udemy.com/api-2.0/discovery-units/?context=topic&from=0&page_size=6&item_count=12&label_id=${label_id}&source_page=topic_page&locale=en_US&currency=usd&skip_price=true`)

        for (let course of started.data.units[1].items) {
            console.log(course.title, course.url)
            const url = `https://www.udemy.com${course.url}`
            links= [...links,{uri:url, topicId}]
        }

        for (let i of started.data.units[1].available_filters.units){
            const available_filters =  await axios.get(`https://udemy.com${i.url}&source_page=topic_page`)
            for (let item of available_filters.data.unit.items){
                links = [... links, {uri: `https://www.udemy.com${item.url}`, topicId}]

            }
        }
    
    } catch (error) {
        console.log(error)
    }

    return links
}    

async function getAll(fetTopicData, parent_id) {
    let rows = fetTopicData.filter(item => item.parent_id === parent_id);
    if (rows.length === 0) {
      return null;
    }
    let data = {};
    for (let i = 0; i < rows.length; i++) {
      data[rows[i]["id"]] = {
        n: rows[i]["name"],
        c: await getAll(fetTopicData, rows[i]["id"])
      };
    }
    return data;
  }

  const Feed = require('feed').Feed;
  const ultil = require('./service/ulltil')
  const { writeFile } = require('fs').promises;
const { /* createReadStream, */ createWriteStream } = require('fs');
const DOMAIN = process.env.DOMAIN
  const main = async () => {
  //   try {
  //     const fetTopicData = await db.Topic.findAll();
  //     const rows = JSON.parse(JSON.stringify(fetTopicData, null, 2));
  
  //     const topics = await getAll(rows, 0);
  
  //     console.log(topics);
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }

 
  // const getlastpart = (url) => {
  //   const parts = url.split('/');; // Tìm vị trí của dấu '/' cuối cùng trong chuỗi
  //   const lastPart = parts[parts.length - 2];
  //   return lastPart
  // }

  
  // Sử dụng hàm getItemListElement với đoạn mã HTML
  // const response = await gotScraping({
  //   url: 'https://www.udemy.com/course/decodingdevops/?fbclid=IwAR1_XGHZg6cs7WGrS3OKQIJtVgvNbXvLd7ADHxLXL6M3HdTuDLe8inRtQCI',

  // });
  // const $ = cheerio.load(response.body);
  // let scriptContents = JSON.parse($('script[type="application/ld+json"]').html())
  // ;
  // scriptContents = scriptContents[scriptContents.length -1]
  // const topic = scriptContents.itemListElement[scriptContents.itemListElement.length -1]
  // console.log({ text: topic.name, href: getlastpart(topic.item) })

  // const myURL = new URL('https://www.udemy.com/course/helm-masterclass-50-practical-demos-for-kubernetes-devops/');
  // console.log(myURL.pathname);
    // for ( let i of courses) {
 
    // }
  // await ultil.hand_coursetoTopics(courses)
  // await db.course_topic.destroy({where: { course_id :3103}})
  const blog = await db.Blog.findAll({
    limit: 10,
    order:[['id', 'DESC']]
   })

   const course = await db.course.findAll({
    limit: 30,
    order: [['id', 'DESC']],
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
  main();
