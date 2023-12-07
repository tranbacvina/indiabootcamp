const axios = require("axios");
const { oneCourseLink, createNewCourse } = require("../service/course")
const { gotScraping } = require('got-scraping');
const db = require("../models")
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
      url = url.replace(/\/\/[^.]*\.udemy\.com/, '//www.udemy.com');
      url = url.replace(/\/$/, '');
      return url;
    } 
    if (link.includes("udemy.com")){
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
    `https://www.udemy.com/api-2.0/courses/${uri}/?fields[course]=price_detail,price,title,context_info,primary_category,primary_subcategory,avg_rating_recent,visible_instructors,locale,estimated_content_length,num_subscribers,image_480x270,description,is_in_any_ufb_content_collection,url,headline,is_practice_test_course`, {
    headers: {
      'Authorization': 'Bearer KXQLyTEfXW9uBWSHjf81rfzBELwOFowQ+hzKys9btDQ:uqTwJUji3daRFP/SmTQkUiyg5wP/OYJh/XG2dkIsOIw',
    }
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
    const course = await oneCourseLink(urlfixshare_udemy)

    if (course) {
      if (course.is_practice_test_course) {
        return { success: false, data: course, messenger: "Không hỗ trợ khoá học này" }
      }
      return { success: true, data: course }
    } else {
      const { udemydata, sections } = await cawnUdemy(patch)
      const { requirements, whatyouwilllearn } = await scrapingUdemy(urlfixshare_udemy)

      if (udemydata.is_practice_test_course) {
        return { success: false, data: udemydata, messenger: "Không hỗ trợ khoá học này" }
      }

      const newCourse = await createNewCourse(udemydata.title, urlfixshare_udemy, udemydata.headline, udemydata.image_480x270, 50000, udemydata.is_practice_test_course, udemydata.description, whatyouwilllearn, requirements, sections.curriculum_context.data, udemydata.price_detail.amount)

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
    const sections = []
    const panel = $('.panel').map((i, e) => {
      const title = $(e).find('.panel-title').text().trim().replace(/\n/g, '')

      const items = $(e).find('.panel-body').find('.col').map((i, e) => {

        const title = $(e).find('.title').text().trim().replace(/\n/g, '')
        const content_summary = $(e).find('.time').text().trim().replace(/\n/g, '')

        return { title, content_summary };
      }).get()
      sections.push({ title, items, lecture_count: items.length });
    })
    const originprice = parseInt($('.big-price:first').text().replace(/[,.đ]/g, ''))

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

    return {
      name,
      description,
      image,
      price,
      is_practice_test_course: false,
      description_log,
      whatyouwilllearn,
      requirements: [],
      sections: { sections },
      originprice,
      parentTopic, topic
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
        requirements, sections,
        originprice,
        parentTopic, topic } = await cawnUnica(urlfixshare_udemy)


      const newCourse = await createNewCourse(name, urlfixshare_udemy, description, image, price, is_practice_test_course, description_log, whatyouwilllearn, requirements, sections, originprice)

     
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
    const description = $(".line-clamp-2-lines").text();
    const image = $("meta[property='og:image']").attr("content")

    const price = 50000
    const description_log = $('.cou-description').html()
    const whatyouwilllearn = $('.pixcel-content').map((i, e) => { return $(e).text().trimStart().replace(/[\t\n]/gm, '') }).get()

    const sections = []
    const contentList = $('.content-list').map((i, e) => {
      const title = $(e).find('h3').text()
      const items = $(e).find('li').map((i, e) => {
        const title = $(e).find('.lecture-title').text().split('.')[1].trim().replace(/[\t\n]/gm, '')
        const content_summary = $(e).find('.duration').text().trim().replace(/[\t\n]/gm, '')
        return { title, content_summary };
      }).get()
      sections.push({ title, items, lecture_count: items.length });
    })

    const originprice = parseInt($('.sale-price-display-js:first').text().replace(/[,.đ]/g, ''))
    

    return {
      name,
      description,
      image,
      price,
      is_practice_test_course: false,
      description_log,
      whatyouwilllearn,
      requirements: [],
      sections: { sections },
      originprice,
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
        requirements, sections,
        originprice, } = await cawnGitio(urlfixshare_udemy)
      
      const newCourse = await createNewCourse(name, urlfixshare_udemy, description, image, price, is_practice_test_course, description_log, whatyouwilllearn, requirements, sections, originprice)
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
