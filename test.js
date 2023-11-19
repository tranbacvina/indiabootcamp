const cawn_data = require("./service/cawn_data_test")
const db =require('./models')
const { Op } = require("sequelize");
const { includes, conforms } = require("lodash");
const axios = require('axios')

const hand_coursetoTopics = async (links) => {
        const promises = []
        for (let link of links) {
            const regex = /(udemy.com|unica.vn|kt.city\/course|gitiho.com\/khoa-hoc)/g;
            const expression = link.uri.match(regex);
            switch (expression[0]) {
                case "unica.vn":
                    promises.push(cawn_data.unica(link))
                    break;
                case "udemy.com":
                    promises.push(cawn_data.udemy(link))
                    break;
                case "gitiho.com/khoa-hoc":
                    promises.push(cawn_data.gitiho(link))
                    break;
                default:
                    promises.push({ success: false, data: '', messenger: "Lỗi, Không hỗ trợ khoá học này" })
    
            }
        }
        const result = await Promise.all(promises)
    
        console.log(result)
}
const slugify = str =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

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
const main = async() => {
    

    // const getTopics = await axios.get('https://www.udemy.com/api-2.0/discovery-units/?context=topic&from=0&page_size=6&item_count=12&label_id=5726&source_page=topic_page&locale=vi_VN&currency=usd&skip_price=true')
    // for (let item of getTopics.data.units[3].items) {
    //     console.log('begin' , item.display_name)
    //     console.log(item.id, item.display_name)
    //     const [topic, creaed] = await db.Topic.findOrCreate({
    //         where: {
    //             name: item.display_name
    //         },
    //         default:{
    //             name:item.display_name,
    //             slug: slugify(item.display_name),
    //             seotitle:item.display_name,
    //             seodescription:item.display_name,
    //         }
    //     })
    //     let links = []
    //     const getstarted = await getdiscovery_context(item.id,topic.id)
    //     const allCourse =  await getAllCourses(item.id,topic.id)
    //     links = [...allCourse, ...getstarted]
    //     console.log(links)
    //     await hand_coursetoTopics(links)
    //     console.log('end -------------' , item.display_name)

    // }

    // const courses = await db.course.findAll()
    // for (let course of courses) {
    //     course.description = course.description.trim().replace(/^\s+|\s+$/g, '');
    //     await course.save()
    // }

    // const course = await db.course.findOne({
    //     where:{
    //         slug: 'bcg01-xay-dung-he-thong-bao-cao-quan-tri-bang-excel'
    //     },
    //     includes:{model: db.rating}
    // })
    // await course.createRating({email:"muhalog@gmail.com",comments:'Đã nhận khoá học',star:3})
    // console.log(course)

    const ratings = [
        {
          "id": 1,
          "email": "fullboot@gmail.com",
          "comments": "Đầy đủ video",
          "star": 4,
          "courseId": 2575,
          "createdAt": "2023-11-16T16:46:04.000Z",
          "updatedAt": "2023-11-16T16:46:04.000Z"
        },
        {
          "id": 2,
          "email": "muhalog@gmail.com",
          "comments": "Đã nhận khoá học",
          "star": 3,
          "courseId": 2575,
          "createdAt": "2023-11-16T16:48:32.000Z",
          "updatedAt": "2023-11-16T16:48:32.000Z"
        }
      ];
      
      function calculateStats(ratings) {
        const stats = {
          "1": { count: 0, percent: 0 },
          "2": { count: 0, percent: 0 },
          "3": { count: 0, percent: 0 },
          "4": { count: 0, percent: 0 },
          "5": { count: 0, percent: 0 },
          avg: 0
        };
      
        let totalStars = 0;
      
        for (const rating of ratings) {
          stats[rating.star].count++;
          totalStars += rating.star;
        }
      
        stats.avg = (totalStars / (ratings.length * 5)) * 5;
      
        for (const key in stats) {
          if (key !== 'avg') {
            const percentage = ((stats[key].count / ratings.length) * 100).toFixed(0);
            stats[key].percent = percentage + '%';
          }
        }
      
        return { avg: stats.avg.toFixed(2), ...stats };
      }
      
      const result = calculateStats(ratings);
      console.log(result);
      
}
main()
