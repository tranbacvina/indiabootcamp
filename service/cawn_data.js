const axios = require("axios");
const { oneCourseLink, createNewCourse } = require("../service/course")
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
    `https://www.udemy.com/api-2.0/courses/${uri}/?fields[course]=price_detail,price,title,context_info,primary_category,primary_subcategory,avg_rating_recent,visible_instructors,locale,estimated_content_length,num_subscribers,image_480x270,description,is_in_any_ufb_content_collection,url,headline,is_practice_test_course`
  )
  const sections = await axios.get(`https://www.udemy.com/api-2.0/course-landing-components/${udemydata.data.id}/me/?components=curriculum_context`)
  return {udemydata:udemydata.data,sections:sections.data}
}

const udemy = async (uri) => {
  console.log(uri)
  const urlfixshare_udemy = await base_url(uri)
  const patch = urlfixshare_udemy.split('/')[4];
  const fixURL = new URL(uri).origin + '/course/' + patch
  try {
    const course = await oneCourseLink(fixURL)

    if (course) {
      if (course.is_practice_test_course) {
        return { success: false, data: course, messenger: "Không hỗ trợ khoá học này" }
      }
      return { success: true, data: course }
    } else {
      const {udemydata,sections} = await cawnUdemy(patch)
      const { requirements, whatyouwilllearn } = await scrapingUdemy(fixURL)

      const newCourse = await createNewCourse(udemydata.title, fixURL, udemydata.headline, udemydata.image_480x270, 50000, udemydata.is_practice_test_course, udemydata.description, whatyouwilllearn, requirements,sections.curriculum_context.data,udemydata.price_detail.amount)

      if (newCourse.is_practice_test_course) {
        return { success: false, data: newCourse, messenger: "Không hỗ trợ khoá học này" }
      }
      return { success: true, data: newCourse }
    }



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
    const description = $("div[itemprop='description']").text().trim().replace(/^\s+|\s+$/g, '');
    const image = `https://unica.vn/${$("meta[property='og:image']").attr("content")}`;
    const price = 50000
    const description_log = $('#u-des-course').html()
    const whatyouwilllearn = $('.title-learn').map((i, e) => { return $(e).text().trimStart().replace(/[\t\n]/gm, '') }).get()


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

const unica = async (uri) => {
  const urlfixshare_udemy = await base_url(uri)
  try {
    const course = await oneCourseLink(urlfixshare_udemy)

    if (course) {
      if (course.is_practice_test_course) {
        return { success: false, data: course, messenger: "Không hỗ trợ khoá học này" }
      }
      return { success: true, data: course }
    } else {
      const { name,
        description,
        image,
        price,
        is_practice_test_course,
        description_log,
        whatyouwilllearn,
        requirements } = await cawnUnica(urlfixshare_udemy)


      const newCourse = await createNewCourse(name, urlfixshare_udemy, description, image, price, is_practice_test_course, description_log, whatyouwilllearn, requirements,)

      if (newCourse.is_practice_test_course) {
        return { success: false, data: newCourse, messenger: "Không hỗ trợ khoá học này" }
      }
      return { success: true, data: newCourse }
    }



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
    const description = $("meta[name='description']").attr("content").trim().replace(/^\s+|\s+$/g, '');
    const image = $("meta[property='og:image']").attr("content")

    const price = 50000
    const description_log = $('.cou-description').html()
    const whatyouwilllearn = $('.pixcel-content').map((i, e) => { return $(e).text().trimStart().replace(/[\t\n]/gm, '') }).get()


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

const gitiho = async (uri) => {
  const urlfixshare_udemy = await base_url(uri)
  try {
    const course = await oneCourseLink(urlfixshare_udemy)

    if (course) {
      if (course.is_practice_test_course) {
        return { success: false, data: course, messenger: "Không hỗ trợ khoá học này" }
      }
      return { success: true, data: course }
    } else {
      const { name,
        description,
        image,
        price,
        is_practice_test_course,
        description_log,
        whatyouwilllearn,
        requirements } = await cawnGitio(urlfixshare_udemy)


      const newCourse = await createNewCourse(name, urlfixshare_udemy, description, image, price, is_practice_test_course, description_log, whatyouwilllearn, requirements,)

      if (newCourse.is_practice_test_course) {
        return { success: false, data: newCourse, messenger: "Không hỗ trợ khoá học này" }
      }
      return { success: true, data: newCourse }
    }



  } catch (error) {
    console.log(error)
    return { success: false, data: '', messenger: "Lỗi, Không hỗ trợ khoá học này" }
  }
};

module.exports = {
  getDriveUdemy, udemy, givenamereturndrive, unica, gitiho
};
