const axios = require("axios");
const { oneCourseLink, createNewCourse } = require("../service/course")
const { gotScraping } = require('got-scraping');
const db = require("../models")
const cheerio = require("cheerio");

const getDriveUdemy = async (links) => {
  const unica = await axios.post(`${process.env.API_CHECK_COURSE}`,
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
      url = url.replace(/\/\/[^.]*\.udemy\.com/, '//www.udemy.com');
      url = url.replace(/\/$/, '');
      return url;
    }

    if (link.includes("udemy.com")) {
      const parse = new URL(link);
      var url = parse.origin + parse.pathname;
      url = url.replace(/\/\/[^.]*\.udemy\.com/, '//www.udemy.com');
      url = url.replace(/\/$/, '');
      return url;
    }
    const parse = new URL(link);
    var url = parse.origin + parse.pathname;
    return url;



  } catch (error) {
    console.log(error)
  }

};

const scrapingUdemy = async (link) => {
  const response = await gotScraping({
    url: link,

  });
  let $ = cheerio.load(response.body);
  const requirements = $("h2.requirements--title--2wsPe").next().children().map((i, e) => { return $(e).text() }).get()
  const whatyouwilllearn = $(".what-you-will-learn--objectives-list-two-column-layout--rZLJy").children().map((i, e) => { return $(e).text() }).get()

  const data = { requirements, whatyouwilllearn }

  return data
}

const cawnUdemy = async (uri) => {
  const udemydata = await axios.get(
    `https://www.udemy.com/api-2.0/courses/${uri}/?fields[course]=is_practice_test_course,price_detail,price,title,context_info,primary_category,primary_subcategory,avg_rating_recent,visible_instructors,locale,estimated_content_length,num_subscribers,image_480x270,description,is_in_any_ufb_content_collection,url,headline,?persist_locale=&locale=en_US`, {
    
    }
  )
  const sections = await axios.get(`https://www.udemy.com/api-2.0/course-landing-components/${udemydata.data.id}/me/?components=curriculum_context`)

  return { udemydata: udemydata.data, sections: sections.data }
}

const udemy = async (uri) => {
  console.log(uri)
  const urlfixshare_udemy = await base_url(uri)
  const patch = urlfixshare_udemy.split('/')[4];
  try {
    let course = await oneCourseLink(urlfixshare_udemy)
  
    
    if (course) {

      if (course.is_practice_test_course) {
        return { success: false, data: course, messenger: "Not supported for this course, contact the admin for advice. Buy Giftcode." }
      }

      // const updateCourse = await db.course.update({
      //   name: udemydata.title,
      //   sections: sections.curriculum_context.data,
      //   price: 50000,
      //   originprice:udemydata.price_detail.amount,
      //   is_practice_test_course: udemydata.is_practice_test_course
      // }, {where : {id: course.id}})

      // course = await oneCourseLink(urlfixshare_udemy)
      return { success: true, data: course }

    } else {
      const { udemydata, sections } = await cawnUdemy(patch)
      const { requirements, whatyouwilllearn } = await scrapingUdemy(urlfixshare_udemy)
      if (udemydata.is_practice_test_course) {
        return { success: false, data: udemydata, messenger: "Not supported for this course, contact the admin for advice. Buy Giftcode." }
      }

      const newCourse = await createNewCourse(udemydata.title, urlfixshare_udemy, udemydata.headline, udemydata.image_480x270, 50000, udemydata.is_practice_test_course, udemydata.description, whatyouwilllearn, requirements, sections.curriculum_context.data, udemydata.price_detail.amount)

      return { success: true, data: newCourse }
    }



  } catch (error) {
    console.log(error)
    return { success: false, data: '', messenger: "Error, not supported for this course." }
  }
};



module.exports = {
  getDriveUdemy, udemy, givenamereturndrive, 
};
