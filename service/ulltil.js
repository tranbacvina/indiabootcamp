const db = require('../models')
const axios = require('axios')
const { Sequelize, Op } = require("sequelize");
const cawn_data_test = require('../service/cawn_data_test')

async function getTopicWithParents(topicID) {
    const topic = await db.Topic.findOne({ where: { id: topicID } });
  
    if (!topic) {
      return null; // Trả về null nếu không tìm thấy category
    }
    if (topic.parent_id == null) {
      return{
        category: topic,
        parents: []
      };
    }
    const parents = [];
    let currentTopicId = topic.parent_id;
  
    while (currentTopicId !== 0) {
      const parentTopic = await  db.Topic.findOne({ where: { id: currentTopicId } });
      if (!parentTopic || topic.parent_id == topic.id) {
        
        break; // Dừng nếu không tìm thấy parent category
      }
  
      parents.push({
        name: parentTopic.name,
        slug: parentTopic.slug,
      });
  
      if(parentTopic.parent_id == parentTopic.id){
        break
      }
      currentTopicId = parentTopic.parent_id;
    }
  
    return {
      category: topic,
      parents: parents.reverse(), // Đảo ngược thứ tự để có thứ tự từ gốc đến category
    };
  }


function calculateStats(ratings) {
    const stats = {
      s1: { count: 0, percent: 0 },
      s2: { count: 0, percent: 0 },
      s3: { count: 0, percent: 0 },
      s4: { count: 0, percent: 0 },
      s5: { count: 0, percent: 0 },
      avg: 0
    };
  
    let totalStars = 0;
  
    for (const rating of ratings) {
      stats['s' + rating.star].count++;
      totalStars += rating.star;
    }
  
    stats.avg = (totalStars / (ratings.length * 5)) * 5;
  
    for (const key in stats) {
      if (key !== 'avg') {
        const percentage = ((stats[key].count / ratings.length) * 100).toFixed(0);
        stats[key].percent = percentage ;
      }
    }
  
    return { avg: stats.avg.toFixed(1), ...stats };
}
function maskEmail(email) {
  // Tách phần tên người dùng và domain
  const [username, domain] = email.split('@');

  // Lấy ba ký tự đầu tiên của phần tên người dùng
  const maskedUsername = username.substring(0, 3) + '***';

  // Ghép lại username đã mask và domain để tạo địa chỉ email mới
  const maskedEmail = maskedUsername + '@' + domain;
  console.log(maskedEmail)
  return maskedEmail;
}

const hand_coursetoTopics = async (courses) => {
  const promises = []
  for (let link of courses) {
  console.log(link.url)

      const regex = /(udemy.com|unica.vn|kt.city\/course|gitiho.com\/khoa-hoc)/g;
      const expression = link.url.match(regex);
      if(expression == null) { continue}
      switch (expression[0]) {
          case "unica.vn":
               await cawn_data_test.unica(link)
              break;
          case "udemy.com":
               await cawn_data_test.udemy(link)
              break;
          case "gitiho.com/khoa-hoc":
               await cawn_data_test.gitiho(link)
              break;
          default:
            console.log({ success: false, data: '', messenger: "Lỗi, Không hỗ trợ khoá học này" })

      }
  }
  // const result = await Promise.all(promises)

  // console.log(result)
}

const fixCourseTopicImage = async () => {
 
    const courses = await db.course.findAll()
    await hand_coursetoTopics(courses)


}


 module.exports = {getTopicWithParents,calculateStats,maskEmail,fixCourseTopicImage}