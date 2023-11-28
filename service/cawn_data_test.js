const axios = require("axios");
const db = require("../models")
const { oneCourseLink,  } = require("../service/course")
const { gotScraping } = require('got-scraping');

const cheerio = require("cheerio");

const getDriveUdemy = async (links) => {
  const unica = await axios.post(`${process.env.API_CHECK_COURSE}/checkcourseudemy`,
    { links: links }
  )
  return unica.data
}
const givenamereturndrive = async (names) => {
  const unica = await axios.post(`${process.env.API_CHECK_COURSE}/givenamereturndrive`,
    { names: names }
  )
  return unica.data
}

const base_url = async (link) => {
  try {
    const haveShare = link.includes("/share/")
    if (haveShare) {
      const res = await gotScraping
        .get(link)

      const parse = new URL(res.url);
      var url = parse.origin + parse.pathname;
      return url;
    } else {
      const parse = new URL(link);
      var url = parse.origin + parse.pathname;
      return url;
    }


  } catch (error) {
    console.log(error)
  }

};

const getlastpart = (url) => {
  const parts = url.split('/'); ; // Tìm vị trí của dấu '/' cuối cùng trong chuỗi
  const lastPart = parts[parts.length - 2];
return lastPart
}

const scrapingUdemy = async (link) => {
  const response = await gotScraping({
    url: link,

  });
  let $ = cheerio.load(response.body);
  const requirements = $("h2.requirements--title--2wsPe").next().children().map((i, e) => { return $(e).text() }).get()
  const whatyouwilllearn = $(".what-you-will-learn--objectives-list-two-column-layout--rZLJy").children().map((i, e) => { return $(e).text() }).get()
  const lastAnchor = $(".topic-menu").find("a").last()
  const href = getlastpart(lastAnchor.attr('href')); // Lấy giá trị của thuộc tính href
  const text = lastAnchor.text(); // Lấy nội dung của thẻ a
  const data = { requirements, whatyouwilllearn,topic:{text,href} }
  return data
}

const cawnUdemy = async (uri) => {
  const udemydata = await axios.get(
    `https://www.udemy.com/api-2.0/courses/${uri}/?fields[course]=price_detail,price,title,context_info,primary_category,primary_subcategory,avg_rating_recent,visible_instructors,locale,estimated_content_length,num_subscribers`
  )


  const sections = await axios.get(`https://www.udemy.com/api-2.0/course-landing-components/${udemydata.data.id}/me/?components=curriculum_context`)
  return {udemydata:udemydata.data,sections:sections.data}
}

const udemy = async (uri) => {
  const urlfixshare_udemy = await base_url(uri.url)
  const patch = urlfixshare_udemy.split('/')[4];
  // const fixURL = new URL(uri.uri).origin + '/course/' + patch
  try {
    // const course = await oneCourseLink(fixURL)

    // if (course) {
    //   if (course.is_practice_test_course) {
    //     return { success: false, data: course, messenger: "Không hỗ trợ khoá học này" }
    //   }
    //   console.log('đã tồn tại course, đang sửa topicid')
    //   await course.addTopic(uri.topicId)
    //   return { success: true, data: course }
    // } else {
    //   const data_course = await cawnUdemy(patch)

    //   const { requirements, whatyouwilllearn } = await scrapingUdemy(fixURL)

    //   const newCourse = await createNewCourse(data_course.data.title, fixURL, data_course.data.headline, data_course.data.image_480x270, 50000, data_course.data.is_practice_test_course, data_course.data.description, whatyouwilllearn, requirements, uri.topicId)

    //   if (newCourse.is_practice_test_course) {
    //     return { success: false, data: newCourse, messenger: "Không hỗ trợ khoá học này" }
    //   }
    //   return { success: true, data: newCourse }
    // }

    const {udemydata,sections} = await cawnUdemy(patch)
    const  { requirements, whatyouwilllearn,topic } = await scrapingUdemy(urlfixshare_udemy)
    // uri.originprice = udemydata.price_detail.amount
    // uri.sections = sections.curriculum_context.data
    const [topics, created]  = await db.Topic.findOrCreate(
      {
        where: {slug: topic.href},
        defaults: {
          slug: topic.href,
          name:topic.text
        }
      }
      )
      console.log('add course to topic', topics.name)
      uri.TopicId = topics.id
      await uri.save()

      const [primary_subcategory, cprimary_subcategory]  = await db.Topic.findOrCreate(
        {
          where: {slug: udemydata.primary_subcategory.title_cleaned},
          defaults: {
            name: udemydata.primary_subcategory.title,
            slug: udemydata.primary_subcategory.title_cleaned
          
          }
        }
        )
        console.log('add topic to primary_subcategory', primary_subcategory.name)
        topics.parent_id = primary_subcategory.id
        await topics.save()

        const [primary_category, cprimary_category]  = await db.Topic.findOrCreate(
          {
            where: {slug: udemydata.primary_category.title_cleaned},
            defaults: {
              name: udemydata.primary_category.title,
              slug: udemydata.primary_category.title_cleaned
            
            }
          }
          )
          console.log('add primary_subcategory to primary_category', primary_category.name)
          primary_subcategory.parent_id = primary_category.id
          await primary_subcategory.save()

          await uri.setTopics([topics.id, primary_category.id,primary_subcategory.id])


  } catch (error) {
    console.log(error)
    return { success: false, data: '', messenger: "Lỗi, Không hỗ trợ khoá học này" }
  }
};

const cawnUnica = async (link) => {
  try {
    const get_web = await axios.get(link);
    let $ = cheerio.load(get_web.data);

    const name = $('h1').children().text()
    const description = $("div[itemprop='description']").text();
    const image = `https://unica.vn/${$("meta[property='og:image']").attr("content")}`;
    const price = 50000
    const description_log = $('#u-des-course').html()
    const whatyouwilllearn = $('.title-learn').map((i, e) => { return $(e).text().trimStart().replace(/[\t\n]/gm, '') }).get()
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
    const originprice =  parseInt($('.big-price:first').text().replace(/[,.đ]/g, ''))
    const breadcrumb = $(".breadcumb-detail-course").children().last().text().trim()
    const parent = $(".breadcumb-detail-course").children().last().prev().prev().text()

    return {
      name,
      description,
      image,
      price,
      is_practice_test_course: false,
      description_log,
      whatyouwilllearn,
      requirements: [],
      sections,
      originprice,
      breadcrumb,parent
    }
  } catch (error) {
    console.log(error)
    return error
  }

}

const unica = async (uri) => {
  const urlfixshare_udemy = await base_url(uri.url)
  try {
    // const course = await oneCourseLink(urlfixshare_udemy)

    // if (course) {
    //   if (course.is_practice_test_course) {
    //     return { success: false, data: course, messenger: "Không hỗ trợ khoá học này" }
    //   }
    //   console.log('đã tồn tại course, đang sửa topicid')
    //    await course.setTopics(uri.topicId)
    //   return { success: true, data: course }
    // } else {
    //   const { name,
    //     description,
    //     image,
    //     price,
    //     is_practice_test_course,
    //     description_log,
    //     whatyouwilllearn,
    //     requirements } = await cawnUnica(urlfixshare_udemy)


    //   const newCourse = await createNewCourse(name, urlfixshare_udemy, description, image, price, is_practice_test_course, description_log, whatyouwilllearn, requirements, uri.topicId)
    //   await newCourse.addTopics(uri.topicId)

    //   if (newCourse.is_practice_test_course) {
    //     return { success: false, data: newCourse, messenger: "Không hỗ trợ khoá học này" }
    //   }
    //   return { success: true, data: newCourse }
    // }

    const {
      name,
      description,
      image,
      price,
      is_practice_test_course,
      description_log,
      whatyouwilllearn,
      requirements,
      sections,
      originprice,
      breadcrumb,parent
    }= await cawnUnica(urlfixshare_udemy)

    // uri.originprice = originprice
    // uri.sections = {sections: sections}
    const [topic, created]  = await db.Topic.findOrCreate(
      {
        where: {name: breadcrumb},
        defaults: {
          name: breadcrumb,
        
        }
      }
      )
     
      const [cparent, createdparent]  = await db.Topic.findOrCreate(
        {
          where: {name: parent},
          defaults: {
            name: parent,
          
          }
        }
        )
        topic.parent_id =cparent.id
        await topic.save()
    if (cparent,topic) {
      await uri.addTopic(cparent.id)
    }
    // await uri.save()

  } catch (error) {
    console.log(error)
    return { success: false, data: '', messenger: "Lỗi, Không hỗ trợ khoá học này" }
  }
};

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

const gitiho = async (uri) => {
  const urlfixshare_udemy = await base_url(uri.url)
  try {
    // const course = await oneCourseLink(urlfixshare_udemy)

    // if (course) {
    //   if (course.is_practice_test_course) {
    //     return { success: false, data: course, messenger: "Không hỗ trợ khoá học này" }
    //   }
    //   console.log('đã tồn tại course, đang sửa topicid')
    //   await course.setTopics(uri.topicId)
    //   return { success: true, data: course }
    // } else {
    //   const { name,
    //     description,
    //     image,
    //     price,
    //     is_practice_test_course,
    //     description_log,
    //     whatyouwilllearn,
    //     requirements } = await cawnGitio(urlfixshare_udemy)


    //   const newCourse = await createNewCourse(name, urlfixshare_udemy, description, image, price, is_practice_test_course, description_log, whatyouwilllearn, requirements, uri.topicId)
    //   await newCourse.setTopics(uri.topicId)

    //   if (newCourse.is_practice_test_course) {
    //     return { success: false, data: newCourse, messenger: "Không hỗ trợ khoá học này" }
    //   }
    //   return { success: true, data: newCourse }
    // }

    const {
      name,
      description,
      image,
      price,
      is_practice_test_course,
      description_log,
      whatyouwilllearn,
      requirements,
      sections,
      originprice,breadcrumb,parent
    }= await cawnGitio(urlfixshare_udemy)

    uri.originprice = originprice
    uri.sections = {sections: sections}
    const [topic, created]  = await db.Topic.findOrCreate(
      {
        where: {name: breadcrumb},
        defaults: {
          name: breadcrumb,
        
        }
      }
      )
     
      if (parent !== 'Khoá học') {
        const [cparent, createdparent]  = await db.Topic.findOrCreate(
          {
            where: {name: parent},
            defaults: {
              name: parent,
            
            }
          }
          )
          topic.parent_id =cparent.id
          await topic.save()
        await uri.addTopic(cparent.id)
      }
      
      await uri.addTopic(topic.id)
      await uri.save()

  } catch (error) {
    console.log(error)
    return { success: false, data: '', messenger: "Lỗi, Không hỗ trợ khoá học này" }
  }
};

const createNewCourse = async (name, url, description, image, price, is_practice_test_course, description_log, whatyouwilllearn, requirements, topicid) => {
  const course = await db.course.create(
      {
          name,
          url,
          description,
          image,
          price,
          is_practice_test_course,
          description_log, whatyouwilllearn, requirements,
          
      },
      {
          include: {
              model: db.Topic
          }
      }

  );
  await course.addTopic(topicid)
  return course
}
module.exports = {
  getDriveUdemy, udemy, givenamereturndrive, unica, gitiho
};
