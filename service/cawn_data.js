const axios = require("axios");
const { oneCourseLink, createNewCourse } = require("../service/course")
const getDriveUdemy = async (links) => {
  const unica = await axios.post(`${process.env.API_CHECK_COURSE}/checkcourseudemy`,
    { links: links }
  )
  return unica.data
}

// const sendEmailOneDrive = async (email, fileID, OneDriveParentReferenceId) => {

//   try {
//     const sendEmail = await axios.post(`${process.env.API_CHECK_COURSE}/sendonedrive`, {
//       email, fileID, OneDriveParentReferenceId
//     })
//     return sendEmail.data
//   } catch (error) {
//     console.log(error)
//     return error
//   }
// }

// const sendgdrive = async (email, fileID) => {

//   try {
//     const sendEmail = await axios.post(`${process.env.API_CHECK_COURSE}/sendgdrive`, {
//       email, fileID
//     })
//     return sendEmail.data
//   } catch (error) {
//     console.log(error)
//     return error
//   }
// }
const base_url = (link) => {
  var parse = new URL(link);
  var url = parse.origin + parse.pathname;
  return url;
};
const cawnUdemy = async (uri) => {
  const udemy = await axios.get(
    `https://www.udemy.com/api-2.0/courses/${uri}/?fields[course]=title,locale,headline,is_practice_test_course,url,published_title,image_480x270,is_in_any_ufb_content_collection`
  )
  return udemy
}
const udemy = async (uri) => {
  const patch = base_url(uri).split('/')[4];
  const fixURL = new URL(uri).origin + '/course/' + patch
  try {
    const course = await oneCourseLink(fixURL)

    if (course) {
      if (course.is_practice_test_course) {
        return { success: false, data: course, messenger: "Không hỗ trợ khoá học này" }
      }
      return { success: true, data: course }
    } else {
      const data_course = await cawnUdemy(patch)

      const newCourse = await createNewCourse(data_course.data.title, fixURL, data_course.data.headline, data_course.data.image_480x270, 50000, data_course.data.is_practice_test_course)
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
  getDriveUdemy, udemy
};
