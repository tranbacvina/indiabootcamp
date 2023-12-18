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
    return {
      category: topic,
      parents: []
    };
  }
  const parents = [];
  let currentTopicId = topic.parent_id;

  while (currentTopicId !== 0) {
    const parentTopic = await db.Topic.findOne({ where: { id: currentTopicId } });
    if (!parentTopic || topic.parent_id == topic.id) {

      break; // Dừng nếu không tìm thấy parent category
    }

    parents.push({
      name: parentTopic.name,
      slug: parentTopic.slug,
      id: parentTopic.id,

    });

    if (parentTopic.parent_id == parentTopic.id) {
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
      stats[key].percent = percentage;
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
    if (expression == null) { continue }
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
  const courses = await db.course.findAll({
   where:{
    topicId: null
   }
  })
  await hand_coursetoTopics(courses)
}

async function handlerTopic(fetTopicData, parent_id) {
  let rows = fetTopicData.filter(item => item.parent_id === parent_id);
  if (rows.length === 0) {
    return null;
  }
  let data = [];
  for (let i = 0; i < rows.length; i++) {
    let children = await handlerTopic(fetTopicData, rows[i]["id"]);
    data.push({
      name: rows[i]["name"],
      id: rows[i]["id"],
      slug: rows[i]["slug"],
      seotitle: rows[i]["seotitle"],
      seodescription: rows[i]["seodescription"],
      children: children
    });
  }
  data.sort((a, b) => a.name.localeCompare(b.name));
  return data;
}

const dropDownHandTopic = (data, level = 0, parentTopic) => {
  let datas = [];
  data.forEach(item => {
    let row = '';
    if (level > 0) {
      for (let i = 0; i < level; i++) {
        row += '- ';
      }
    }

    const res = {
      id: item.id,
      text: row + item.name,
    };
    if (item.id == parentTopic) {
      res['selected'] = true;
    }
    datas.push(res);

    if (item.children) {
      const children = dropDownHandTopic(item.children, level + 1, parentTopic);
      datas = datas.concat(children);
    }
  });
  return datas;
};

function pagination(c, m,url) {
  var current = c,
      last = m,
      delta = 2,
      left = current - delta,
      right = current + delta + 1,
      range = [],
      rangeWithDots = [],
      l;

  for (let i = 1; i <= last; i++) {
      if (i == 1 || i == last || i >= left && i < right) {
          range.push(i);
      }
  }

  for (let i of range) {
      if (l) {
          if (i - l === 2) {
              rangeWithDots.push({ number: l + 1, url: `${url}${l + 1}` });
          } else if (i - l !== 1) {
              rangeWithDots.push({ number: '...', url: '' });
          }
      }
      rangeWithDots.push({ number: i, url: `${url}${i}` });
      l = i;
  }

  return rangeWithDots;
}

function xoaDauSlashCuoiCung(chuoi) {
  // Kiểm tra xem chuỗi có ký tự '/' không và ký tự '/' có ở cuối cùng không
  if (chuoi.lastIndexOf('/') === chuoi.length - 1) {
      // Sử dụng slice để lấy chuỗi mới không có ký tự '/' cuối cùng
      let chuoiSauKhiXoa = chuoi.slice(0, -1);
      return chuoiSauKhiXoa;
  } else {
      return chuoi; // Trả về chuỗi ban đầu nếu không có '/' ở cuối cùng
  }
}
module.exports = {xoaDauSlashCuoiCung,pagination,dropDownHandTopic, handlerTopic, getTopicWithParents, calculateStats, maskEmail, fixCourseTopicImage,hand_coursetoTopics }