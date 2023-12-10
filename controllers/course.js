const cawn_data = require("../service/cawn_data")
var { validationResult } = require('express-validator');
const { findManyCourse_ChuaGui, findMany, createStrucDataCourses, createStrucDataOneCourse, oneCourseID, promiseCourse, oneCourseSlug, findManyCourseTopic, createCourse, update, deleteCourse,findManyApi } = require("../service/course")
const serverCourse = require('../service/course')
const { getDriveUdemy, givenamereturndrive, } = require("../service/cawn_data")
const paginate = require('express-paginate');
const topic = require("../service/topic")
const ultrilSevice = require('../service/ulltil')
const db = require("../models")
const { Op, Sequelize } = require("sequelize");

const schema = require("../service/schema")

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
        const expression = link.match(regex);
        if(expression == null) {
            promises.push({ success: false, data: '', messenger: "Lỗi, Không hỗ trợ khoá học này" })
            continue
        } 

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

const timKiemPage = async (req, res) => {
    const { text, limit, } = req.query
    const course = await findMany(text, limit, req.skip)

    const itemCount = course.count;
    const pageCount = Math.ceil(course.count / req.query.limit);
    res.render('course/timkiem', {
        course: course.rows,
        pageCount,
        itemCount,
        currentPage: req.query.page, text,
        pages: paginate.getArrayPages(req)(10, pageCount, req.query.page),
    });


};

const allCourseTopic = async (req, res) => {
    const { text, limit, } = req.query
    const { slug } = req.params
    const topics = await topic.findAll()

    const course = await findManyCourseTopic(text, limit, req.skip, slug)

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
   

    if (course.length === 0) {
        res.render('layout/404')
    } else {
        const schemaCourses = schema.createStrucDataCourses(course.rows)
        const itemCount = course.count;
        const pageCount = Math.ceil(course.count / req.query.limit);
        res.render('course/allcourse', {
            course: course.rows,
            pageCount,
            itemCount,schemaCourses,
            currentPage: req.query.page,
            pages: paginate.getArrayPages(req)(10, pageCount, req.query.page),
        });

    }
};

const onePublic = async (req, res) => {
    const { slug } = req.params;
    const course = await oneCourseSlug(slug);
    if (!course) {
        res.status(404).render("layout/404")
        return
    }
    const ratings = ultrilSevice.calculateStats(course.ratings)
    const breadcrumb = await ultrilSevice.getTopicWithParents(course.TopicId)
    
    const breadcrumbSchemaCourseOne = schema.breadcumbCourse(breadcrumb,course)

    // const schemaCreativeWorkSeries = schema.CreativeWorkSeries(course,ratings)

    const schemaCourse= schema.createStrucDataOneCourse(course,ratings)
    const courseLienquan = breadcrumb.parents.map(item => item.id)

    const courses = await db.course.findAll({

        include: [
            {
                model: db.Topic,
                where: {
                    id: {[Op.in]: courseLienquan}
                }
            }],
        limit: 16
    }
    );
    res.render("course/one-course", { course, breadcrumb, ratings, courses,breadcrumbSchemaCourseOne,schemaCourse });
   
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
        , sharelinkfree } = req.body
    const updateC = await update(id, name, url, slug, price, priceus, priceindia, topicId, whatyouwilllearn, requirements, description, description_log, image, sharelinkfree)
    res.redirect(`/admin/course/${id}`)
}
const addDriveToCourse = async (req, res) => {
    const { id } = req.params
    const {
        DriveName, DriveID, isOnedrive, OneDriveParentReferenceId } = req.body
    await serverCourse.addDriveToCourse(id, DriveName, DriveID, isOnedrive, OneDriveParentReferenceId)
    res.redirect(`/admin/course/${id}`)
}
const delDriveToCourse = async (req, res) => {
    const { id, iddrive } = req.params
    // const {idDrive,isOneDrive,OneDriveParentReferenceId} = req.body
    await serverCourse.removeDriveToCourse(id, iddrive)

    res.redirect(`/admin/course/${id}`)
}
const deleteCourseColtroler = async (req, res) => {
    const { id } = req.params
    await deleteCourse(id)
    res.redirect('/admin/course')
}

const apiFindAllKeyWord = async (req,res) => {
    const { text } = req.query
    if(!text) {
        res.status(404).send('Not Found')
        return
    }
    const course = await findManyApi(text)
    res.send(course)

}
module.exports = {apiFindAllKeyWord, cawnNameCourseChuaGui, check, courseChuaGui, cawnCourseChuaGui, coursedownload, all, one, sendEmailCourse, publicall, onePublic, allCourseTopic, create, updateCourse, deleteCourseColtroler, addDriveToCourse, delDriveToCourse, timKiemPage }