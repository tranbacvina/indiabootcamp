const cawn_data = require("./service/cawn_data_test")
const db =require('./models')
const { Op } = require("sequelize");
const { includes, conforms } = require("lodash");
const axios = require('axios')
const cheerio = require("cheerio");
const Sequelize = require('sequelize');
const { gotScraping } = require('got-scraping');
const moment = require('moment-timezone')

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

  var RSS = require('rss');
  const ultil = require('./service/ulltil')
  const { writeFile } = require('fs').promises;
const { /* createReadStream, */ createWriteStream } = require('fs');
const { google } = require("googleapis");
const util = require("util");
require('dotenv').config();
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN
const check_regex_bank = (str) => {
  var pattern = /(bootcamp)\s(\d+)\s*(\d*)|bootcamp(\d+)\s*(\d*)/i;
  var result = pattern.test(str);
  var match = str.match(pattern);
  return { result, match };
};
  const main = async () => {
    let Description = 'CUSTOMER MBVCB.5378041801.085939.BOOTCAMP7430.CT tu 0071000937323 HO DAC HA toi 1282012345666 DO NGOC THANG tai MB - Ma GD ACSP tb085939'
    const { result, match } = check_regex_bank(Description);

    console.log(result, match)
    if (result) {
        const OrderID = match[5] ? `${match[4]}${match[5]}` : match[4];
        console.log(typeof(Number(OrderID)))

      }
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
//   const blog = await db.Blog.findAll({
//     limit: 10,
//     order:[['id', 'DESC']]
//    })

//    const course = await db.course.findAll({
//     limit: 30,
//     order: [['id', 'DESC']],
//     where:{
//       TopicId: {
//         [Op.not]: null
//       }
//     }
//    })

//    var feed = new RSS({
//     title: 'Full Bootcamp',
//     description: 'Khoá Học Udemy - Unica - Gitiho 50k - Chia sẻ khoá học miễn phí Online',
//     feed_url: 'https://fullbootcamp.com/sitemaps/rss.xml',
//     site_url: 'https://fullbootcamp.com',
//     image_url: 'https://fullbootcamp.com/img/redketchup/favicon-32x32.png',
//     docs: 'https://fullbootcamp.com/',
//     managingEditor: 'Full Bootcamp',
//     webMaster: 'Full Bootcamp',
//     copyright: '2024 Full Bootcamp',
//     language: 'vi',
//     categories: ['Category 1','Category 2','Category 3'],
//     pubDate: 'May 20, 2012 04:00:00 GMT',
//     ttl: '60',

// });


//     blog.forEach(post => {
//       feed.item({
//         title: post.title,
//         id: `${DOMAIN}/${post.slug}`,
//         url:`${DOMAIN}/${post.slug}`,
//         description: post.description,
//         content: post.content,
//         date: moment().format('ddd, DD MMM YYYY HH:mm:ss ZZ'),
//       });
//     });

//     course.forEach(post => {
//       feed.item({
//         title: post.name,
//         id: `${DOMAIN}/${post.slug}`,
//         url:`${DOMAIN}/${post.slug}`,
//         description: post.description,
//         content: post.content,
//         date: moment().format('ddd, DD MMM YYYY HH:mm:ss ZZ'),
//       });
//     });

//     const path = `./sitemaps/rss.xml`;
//     const rss2 = feed.xml()
//   // Write the RSS XML content to the file
//   writeFile(path, rss2)
//     .then(() => {
//       console.log(`RSS feed generated and saved to ${path}`);
//     })
//     .catch((err) => {
//       console.error('Error writing RSS feed:', err);
//     });

  // const oauth2Client = new google.auth.OAuth2(
  //   CLIENT_ID,
  //   CLIENT_SECRET,
  //   REDIRECT_URI
  // );

  // generate a url that asks permissions for Blogger and Google Calendar scopes
  // const scopes = [
  //   'https://www.googleapis.com/auth/blogger',
  //   'https://www.googleapis.com/auth/calendar'
  // ];

  // const url = oauth2Client.generateAuthUrl({
  //   // 'online' (default) or 'offline' (gets refresh_token)
  //   access_type: 'offline',

  //   // If you only need one scope you can pass it as a string
  //   scope: scopes
  // });
  // console.log(url)
  // const {tokens} = await oauth2Client.getToken('4/0AfJohXlp3j_bfoQAh9y2Bk3UuFqteekp3Z-8Qd6G0aHLdXSHaZ_fm0yci-n1lQOCItn11g')
  // console.log(tokens)
  // oauth2Client.setCredentials({
  //   refresh_token: '1//0eWq4BUhRf3ODCgYIARAAGA4SNwF-L9IrzydzozWXVsjSmGGT7adMn5aux6P6jMPNA_-nMyvVDLGBfHXS1tY4WbZF3Wk6etxf1os'
  // });
  // const blogger = google.blogger({
  //   version: 'v3',
  //   auth: oauth2Client
  // });
  // const params = {
  //   blogId: '5255657091143814201'
  // };
  // const res = await blogger.posts.insert({blogId: params.blogId,requestBody: {
  //   title: 'Hello from the googleapis npm module!',
  //   content:
  //     'Visit https://github.com/google/google-api-nodejs-client to learn more!',
  // },});
  // console.log(res.data)

    // const parse = new URL('https://543543.udemy.com/course/hoidanit-react-basic-ultimate/');
    //   var url = parse.origin + parse.pathname;
    //   url = url.replace(/\/\/[^.]*\.udemy\.com/, '//www.udemy.com');
    //   url = url.replace(/\/$/, '');
    //   console.log(url)
    // console.log(moment().subtract(2, 'd').format("DD/MM/YYYY"))
}


  main();
