const cawn_data = require("./service/cawn_data_test")
const db =require('./models')
const { Op } = require("sequelize");
const { includes, conforms } = require("lodash");
const axios = require('axios')
const cheerio = require("cheerio");
const Sequelize = require('sequelize');

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

const caounica = async(link) => {
    try {
        const get_web = await axios.get(link);
        let $ = cheerio.load(get_web.data);
    
        const name = $('h1').children().text()
        const description = $("div[itemprop='description']").text().trim().replace(/^\s+|\s+$/g, '');
        const image = `https://unica.vn/${$("meta[property='og:image']").attr("content")}`;
        const price = 50000
        const description_log = $('#u-des-course').html()
        const whatyouwilllearn = $('.title-learn').map((i, e) => { return $(e).text().trim().replace(/\n/g, '') }).get()
        const originprice =  parseInt($('.big-price:first').text().replace(/[,.đ]/g, ''))
        const sections = []
        const panel = $('.panel').map((i, e) => {
            const title = $(e).find('.panel-title').text().trim().replace(/\n/g, '')
           
            const items = $(e).find('.panel-body').find('.col').map((i,e) => {
               
                    const title= $(e).find('.title').text().trim().replace(/\n/g, '')
                    const content_summary=  $(e).find('.time').text().trim().replace(/\n/g, '')
               
                return {title,content_summary};
           }).get()
           sections.push({title,items,lecture_count:items.length});
        })
        
        const breadcrumb = $(".breadcumb-detail-course").children('a')
        let parentTopic
        let topic
        if (breadcrumb.length == 3) {
            parentTopic = {name: $(breadcrumb[1]).text(), href: $(breadcrumb[1]).attr('href')}
            topic = {name: $(breadcrumb[2]).text(), href: $(breadcrumb[2]).attr('href')}
        }

        if (breadcrumb.length == 2) {
            parentTopic = null
            topic = {name: $(breadcrumb[1]).text(), href: $(breadcrumb[1]).attr('href')}
        }

        console.log(parentTopic,topic)

        return {
          name,
          description,
          image,
          price,
          is_practice_test_course: false,
          description_log,
          whatyouwilllearn,
          requirements: [],
        }
      } catch (error) {
        console.log(error)
        return error
      }
}

const cawnGitio = async (link) => {
    try {
        const get_web = await axios.get(link);
        let $ = cheerio.load(get_web.data);

        const name = $("h1").text();
        const description = $("meta[name='description']").attr("content")
        const image = $("meta[property='og:image']").attr("content")

        const price = 50000
        const description_log = $('.cou-description').html()
        const whatyouwilllearn = $('.pixcel-content').map((i, e) => { return $(e).text().trim().replace(/[\t\n]/gm, '') }).get()
        const sections = []

        const contentList = $('.content-list').map((i,e) => {
            const title = $(e).find('h3').text()
            const items = $(e).find('li').map((i,e)=> {
                const title = $(e).find('.lecture-title').text().split('.')[1].trim().replace(/[\t\n]/gm, '')
                const content_summary = $(e).find('.duration').text().trim().replace(/[\t\n]/gm, '')
                return {title,content_summary};
            }).get()
            sections.push({title,items,lecture_count:items.length});
        })
        
        const originprice = parseInt($('.sale-price-display-js:first').text().replace(/[,.đ]/g, ''))
        const breadcrumb = $(".gitiho-breadcrumb").children().last().text().trim()
        const parent = $(".gitiho-breadcrumb").children().last().prev().text().trim()
        return {
            name,
            description,
            image,
            price,
            is_practice_test_course: false,
            description_log,
            whatyouwilllearn,
            requirements: [],sections,
            originprice,breadcrumb,parent
        }
    } catch (error) {
    console.log(error)
    return error
    }
  
  }

  async function getTopicWithChildren(topicID) {
 
  
    let  children = [];
  
      const childTopics = await db.Topic.findAll({ where: { parent_id: topicID } });
        for (let item of childTopics) {
            children.push(item)
            const grandchildren = await getTopicWithChildren(item.id);
            children = children.concat(grandchildren);
        }
     
  
    return children
  }
const main = async() => {
    // await cawnGitio('https://gitiho.com/khoa-hoc/pbig01-thanh-thao-microsoft-powerbi-de-truc-quan-hoa-va-phan-tich-du-lieu')
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


// const udemyCourses = await db.course.findAll(
//   {
//     where: {
//         url: {
//             [Op.like]: '%gitiho%'
//         }
//     },
    
     
//   }
//     )
// await hand_coursetoTopics(udemyCourses)
// const { Op } = require("sequelize");
// const children = await db.Topic.findAll({
//     where:{
//         parent_id: 15
//     },
//     attributes: ['id']
    
// })
// const q = [...JSON.parse(JSON.stringify(children, null, 2)), {id: 15}]
// console.log(q)
const duplicates = await db.Blog.findOne({
    where: {
        slug: 'gioi-thieu'
    }
  });
   duplicates.isDeleted = true
   await duplicates.save()
  console.log(JSON.stringify(duplicates, null, 2))
    // const chil = await getTopicWithChildren(905)
    // console.log(chil)


}
main()
