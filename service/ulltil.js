const db = require('../models')

// Hàm lấy thông tin parent của một category cụ thể
async function getTopicWithParents(topicID) {
    const topic = await db.Topic.findOne({ where: { id: topicID } });
  
    if (!topic) {
      return null; // Trả về null nếu không tìm thấy category
    }
  
    const parents = [];
    let currentTopicId = topic.parent_id;
  
    while (currentTopicId !== 0) {
      const parentTopic = await  db.Topic.findOne({ where: { id: currentTopicId } });
      if (!parentTopic) {
        break; // Dừng nếu không tìm thấy parent category
      }
  
      parents.push({
        name: parentTopic.name,
        slug: parentTopic.slug,
      });
  
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
 module.exports = {getTopicWithParents,calculateStats,maskEmail}