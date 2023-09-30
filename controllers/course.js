const cawn_data = require("../service/cawn_data")
var { validationResult } = require('express-validator');
const { findManyCourse_ChuaGui, findMany, createStrucDataCourses, createStrucDataOneCourse, oneCourseID, promiseCourse, oneCourseSlug, findManyCourseTopic, createCourse, update } = require("../service/course")
const { getDriveUdemy, givenamereturndrive, } = require("../service/cawn_data")
const paginate = require('express-paginate');
const topic = require("../service/topic")


const check = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(200).json({
            success: false,
            messenger: errors.array()[0].msg,
            data: ''
        }
        )
    }
    const { links } = req.body;
    const promises = []
    for (let link of links) {
        const regex = /(udemy.com|unica.vn|kt.city\/course|gitiho.com\/khoa-hoc)/g;
        const expression = link.uri.match(regex);
        switch (expression[0]) {
            case "unica.vn":
                promises.push(cawn_data.unica(link))
                break;
            case "udemy.com":
                promises.push(cawn_data.udemy(link))
                break;
            case "gitiho.com/khoa-hoc":
                promises.push(cawn_data.gitiho(link))
                break;
            default:
                promises.push({ success: false, data: '', messenger: "Lỗi, Không hỗ trợ khoá học này" })

        }
    }
    const result = await Promise.all(promises)
    return res.status(200).json(result)
};

const courseChuaGui = async (req, res) => {
    try {
        const { id } = req.query
        const orderItemChuaGui = await findManyCourse_ChuaGui(id)

        res.send(orderItemChuaGui)
    } catch (error) {
        console.log(error)
    }
}

const cawnCourseChuaGui = async (req, res) => {
    try {
        const { id } = req.query
        const orderItemChuaGui = await findManyCourse_ChuaGui(id)
        const links = orderItemChuaGui.map(item => item.course.url)
        const cawn_data = await getDriveUdemy(links)
        const result = orderItemChuaGui.map((item, index) => { return { orderData: item, cawnData: cawn_data[index] } })
        res.send(result)
    } catch (error) {
        console.log(error)
    }
}

const cawnNameCourseChuaGui = async (req, res) => {
    try {
        const { id } = req.query
        const orderItemChuaGui = await findManyCourse_ChuaGui(id)
        const names = orderItemChuaGui.map(item => item.course.name.replace(/[<>:"\/\\|?*#&.']+/g, ''))
        const cawn_data = await givenamereturndrive(names)
        const result = orderItemChuaGui.map((item, index) => { return { orderData: item, cawnData: cawn_data[index] } })
        res.send(result)
    } catch (error) {
        console.log(error)
    }
}

const coursedownload = async (req, res) => {
    try {
        const { id } = req.params

        const orderItemChuaGui = await findManyCourse_ChuaGui(id)
        // res.send(orderItemChuaGui)
        res.render('admin/order/coursedownload', { orderItemChuaGui })
    } catch (error) {
        console.log(error);
    }
}

const all = async (req, res) => {
    const { text, limit, } = req.query
    const course = await findMany(text, limit, req.skip)
    const topics = await topic.findAll()

    // res.send(course)
    const itemCount = course.count;
    const pageCount = Math.ceil(course.count / req.query.limit);


    if (course.length === 0) {

        res.render('layout/404')
    } else {
        const itemCount = course.count;
        const pageCount = Math.ceil(course.count / req.query.limit);
        res.render('admin/course/course', {
            course: course.rows,
            topics,
            pageCount,
            itemCount,
            currentPage: req.query.page,
            pages: paginate.getArrayPages(req)(10, pageCount, req.query.page),
        });

    }
};

const allCourseTopic = async (req, res) => {
    const { text, limit, } = req.query
    const { slug } = req.params
    const topics = await topic.findAll()

    const course = await findManyCourseTopic(text, limit, req.skip, slug)

    // res.send(course)
    const itemCount = course.count;
    const pageCount = Math.ceil(course.count / req.query.limit);


    if (course.length === 0) {

        res.render('layout/404')
    } else {
        const itemCount = course.count;
        const pageCount = Math.ceil(course.count / req.query.limit);

        res.render('admin/course/course', {
            course: course.rows,
            topics,
            pageCount,
            itemCount,
            currentPage: req.query.page,
            pages: paginate.getArrayPages(req)(10, pageCount, req.query.page),
        });

    }
};

const one = async (req, res) => {
    const { id } = req.params;
    const course = await oneCourseID(id);
    const topics = await topic.findAll()
    // res.send(course)
    res.render("admin/course/one-course", { course, topics });
};

const sendEmailCourse = async (req, res) => {
    const { drives } = req.body
    const promise = []
    try {
        for (let drive of drives) {
            promise.push(promiseCourse(drive))
        }
        const data = await Promise.all(promise)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(200).send([{ text: 'Gửi Mail Không thành công' }])
    }
}

const publicall = async (req, res) => {
    const { text, limit, } = req.query
    const course = await findMany(text, limit, req.skip)
    // res.send(course)
    // const itemCount = course.count;
    // const pageCount = Math.ceil(course.count / req.query.limit);

    const structuredDataCourse = createStrucDataCourses(course.rows)
    if (course.length === 0) {

        res.render('layout/404')
    } else {
        const itemCount = course.count;
        const pageCount = Math.ceil(course.count / req.query.limit);
        res.render('course/course', {
            course: course.rows,
            structuredDataCourse,
            pageCount,
            itemCount,
            currentPage: req.query.page,
            pages: paginate.getArrayPages(req)(10, pageCount, req.query.page),
        });

    }
};

const onePublic = async (req, res) => {
    const { slug } = req.params;
    const course = await oneCourseSlug(slug);
    // res.send(course)
    if (course) {
        const structuredDataCourse = createStrucDataOneCourse(course)
        res.render("course/one-course", { course, structuredDataCourse });
    } else {
        res.render("layout/404")
    }
};

const create = async (req, res) => {
    const { name, url, slug, price, priceus, priceindia, topicId, whatyouwilllearn, requirements, description, description_log, image, drivecoursename, drivecourID, isOneDrive, OneDriveParentReferenceId } = req.body
    const newCourse = await createCourse(name, url, slug, price, priceus, priceindia, topicId, whatyouwilllearn, requirements, description, description_log, image, drivecoursename, drivecourID, isOneDrive, OneDriveParentReferenceId)
    res.redirect(`/admin/course/${newCourse.id}`)
}

const updateCourse = async (req, res) => {
    const { id } = req.params
    const {
        name, url, slug, price, priceus, priceindia, topicId, whatyouwilllearn, requirements, description, description_log, image
    } = req.body
    console.log(name, url, slug, price, priceus, priceindia, topicId, whatyouwilllearn, requirements, description, description_log, image)
    const updateC = await update(id, name, url, slug, price, priceus, priceindia, topicId, whatyouwilllearn, requirements, description, description_log, image)
    res.redirect(`/admin/course/${id}`)
}
module.exports = { cawnNameCourseChuaGui, check, courseChuaGui, cawnCourseChuaGui, coursedownload, all, one, sendEmailCourse, publicall, onePublic, allCourseTopic, create, updateCourse }