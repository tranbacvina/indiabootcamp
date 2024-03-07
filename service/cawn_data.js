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
      headers: { 
      'Authorization': 'Bearer F5v5Hn+ROX+wpND4rbn2D7nA4dvHD6dJRJ0T0T9sicc:lq6TEeOxY9Vk1b2A3MHnh63AadNEudbR0EMFObbYfkE', }
    }
  )
  const sections = await axios.get(`https://www.udemy.com/api-2.0/course-landing-components/${udemydata.data.id}/me/?components=curriculum_context`)

  console.log('is_practice_test_course >>>>>>',udemydata.data)
  return { udemydata: udemydata.data, sections: sections.data }
}

const udemy = async (uri) => {
  console.log(uri)
  const urlfixshare_udemy = await base_url(uri)
  const patch = urlfixshare_udemy.split('/')[4];
  try {
    let course = await oneCourseLink(urlfixshare_udemy)
    const { udemydata, sections } = await cawnUdemy(patch)
    const { requirements, whatyouwilllearn } = await scrapingUdemy(urlfixshare_udemy)
    
    if (course) {

      if (course.is_practice_test_course) {
        return { success: false, data: course, messenger: "Không hỗ trợ khoá học này, liên hệ admin để tư vấn Mua Giftcode" }
      }

      const updateCourse = await db.course.update({
        name: udemydata.title,
        sections: sections.curriculum_context.data,
        price: 50000,
        originprice:udemydata.price_detail.amount,
        is_practice_test_course: udemydata.is_practice_test_course
      }, {where : {id: course.id}})

      course = await oneCourseLink(urlfixshare_udemy)
      return { success: true, data: course }

    } else {

      if (udemydata.is_practice_test_course) {
        return { success: false, data: udemydata, messenger: "Không hỗ trợ khoá học này, liên hệ admin để tư vấn Mua Giftcode" }
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

    const name = $('h1').text()
    const description = $('h1').next().text()
    const image = `https://unica.vn/${$("meta[property='og:image']").attr("content")}`;
    const price = 99000
    const description_log = $('.mark').html()


    const targetDiv = $('div:contains("Bạn sẽ học được")').filter((index, element) => {
      return $(element).text().trim() === 'Bạn sẽ học được';
  });
  const whatyouwilllearn = targetDiv.next().find('p').map((index, element) => $(element).text().trim()).get();

  const noidungDiv =  $('div:contains("Nội dung khóa học")').filter((index, element) => {
    return $(element).text().trim() === 'Nội dung khóa học';
  }).next().next().children();
    const sections = []
    const panel = noidungDiv.map((i, e) => {
      if(i == 0 || i % 2 == 0) {
      const t = $(e).find('.flex-auto')
      
        const title = t.text().trim().replace(/\n/g, '')
        const tid = t.parent().attr('data-collapse-toggle')
  
        
        const items = $(`#${tid}`).children().map((i,e) => {
          let title = $(e).find('.text-sm').text().trim().replace(/\s\s/g, '')
          const content_summary = $(e).find('.min-w-12').text().trim()
          return { title, content_summary }
        }).get()
  
        
    
  
        sections.push({ title, items, lecture_count: items.length });
      }

    })
    console.log(sections)
    const originprice = parseInt($('.price-sale:first').text().replace(/[,.đ]/g, ''))


    // let breadcrumb = $(".breadcumb-detail-course").children('a')

    let breadcrumb = $('[aria-label="Breadcrumb"]').find('ol').children()
    let parentTopic
    let topic
    if (breadcrumb.length == 3) {
      parentTopic = { 
        name: $(breadcrumb[1]).find('a').text().trim(), 
       href: $(breadcrumb[1]).find('a').attr('href') 
      }
      topic = { 
        name: $(breadcrumb[2]).find('a').text().trim(), 
        href: $(breadcrumb[2]).find('a').attr('href') 
      }
    }

    if (breadcrumb.length == 2) {
      parentTopic = null
      topic = { 
        name: $(breadcrumb[1]).find('a').text().trim(), 
        href: $(breadcrumb[1]).find('a').attr('href') 
      }
    }

  
console.log(parentTopic, topic)
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
  getDriveUdemy, udemy, givenamereturndrive, unica, gitiho,cawnUnica
};
