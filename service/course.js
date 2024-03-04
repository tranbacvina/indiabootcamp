const paginate = require('express-paginate');
const db = require("../models");
const axios = require("axios");
const ulltil = require("./ulltil")

const { Op } = require("sequelize");
const sharedrive = require("../service/sharedrive");

const oneCourseLink = async (link) => {
    let query = {
        where: {
            url: {
                [Op.like]: `%${link}%`
            }
        },
        attributes: ["id","name","image","price","priceus","priceindia","is_practice_test_course","url","slug","originprice"]
    }
    // if(link.includes('udemy')) {
    //     query.where.url= link
    // }
    let course = await db.course.findAll(query);
    course =JSON.parse(JSON.stringify(course, null, 2))
   // Lọc các mục trong mảng courseData có URL chính xác là "https://www.udemy.com/course/cau-truc-du-lieu-va-giai-thuat-thuc-chien-voi-leetcode"
    const filteredCourses = course.filter(course => {
        const urlsArray = course.url.split(', ');
        return urlsArray.includes(link);
    });
    console.log(filteredCourses)
   if(filteredCourses.length > 0){
    return filteredCourses[0]
   } else {
    return undefined

   }

}
const oneCourseID = async (id) => {
    return await db.course.findOne({
        where: {
            id
        },
        include: [{ model: db.driveCourse }, { model: db.Topic }]
    });
}
const oneCourseSlug = async (slug) => {
    return await db.course.findOne({
        nest: true,
        where: {
            slug
        },
        include: [{ model: db.Topic }, { model: db.rating }],
    });
}
const createNewCourse = async (name, url, description, image, price, is_practice_test_course, description_log, whatyouwilllearn, requirements, sections, originprice) => {
    const course = await db.course.create(
        {
            name,
            url,
            description,
            image,
            price,
            is_practice_test_course,
            description_log, whatyouwilllearn, requirements, sections, originprice

        },
        {
            include: {
                model: db.Topic
            }
        }

    );
    return course
}
const findManyCourse_ChuaGui = async (id) => {
    const query = {
        attributes: ['id'],
        order: [['id', 'DESC']],
        include:
            [{
                model: db.course,
                attributes: ['url', 'name'],
            },
            {
                model: db.order,
                where: { status: 'Paid' },
                attributes: ['id', 'email', 'createdAt', 'status'],
            }],
        where: {
            status: 'Chua gui'
        }
    }
    if (id) { query.where.orderID = id }

    return await db.orderItem.findAll(
        query,
    )
}
const findMany = async (text, page) => {
    const limit = 36
    const skip = (limit * page) - limit
    const query = {
        limit: limit,
        offset: skip,
        order: [['id', 'DESC']],
        include: { model: db.Topic },
        attributes: ['image', 'id', 'name', 'url', 'slug', 'price', 'originprice', 'description']
    }
    if (text) {
        query['where'] = {
            [Op.or]: [
                { name: { [Op.like]: `%${text}%` } },
                { url: { [Op.like]: `%${text}%` } }
            ]
        }
    }

    return await db.course.findAndCountAll(query)
}

const findManyCourseTopic = async (text, limit, skip, topic) => {
    const query = {
        limit: limit,
        offset: skip,
        order: [['updatedAt', 'DESC']],
        attributes: ['name', 'slug', 'image', 'updatedAt', 'description', 'price', 'originprice', 'url',"id"],
        include: [{ model: db.rating }]
    }
    if (text) {
        query['where'] = {
            [Op.or]: [

                { name: { [Op.like]: `%${text}%` } },
                { url: text }
            ]
        }
    }
    if (topic) {
        query['include'] = [...query['include'], {
            model: db.Topic,
            where: {
                slug: topic
            }
        }]

    }
    return await db.course.findAndCountAll(query)
}

const findManyCourseTopicV2 = async (text, page, topic) => {
    const limit = 36
    const skip = (limit * page) - limit
    const query = {
        limit: limit,
        offset: skip,
        order: [['updatedAt', 'DESC']],
        attributes: ['name','is_practice_test_course', 'slug', 'image', 'updatedAt', 'description', 'price', 'originprice', 'url'],
        include: [{ model: db.rating }],
        where: {
            [Op.or]: [
                {is_practice_test_course: false},
                {is_practice_test_course: null}

            ]
            
        }
    }
    if (text) {
        query['where'] = {
            
            is_practice_test_course: false,
            [Op.or]: [

                { name: { [Op.like]: `%${text}%` } },
                { url: text }
            ],
        }
    }
    if (topic) {
        query['include'] = [...query['include'], {
            model: db.Topic,
            where: {
                slug: topic
            }
        }]

    }
    return await db.course.findAndCountAll(query)
}

const promiseCourse = async (drive) => {
    const email = drive.email
    const id = drive.id_Drive
    const idOrder = drive.idorderItems
    const drivename = drive.drivename
    const isOneDrive = drive.isOneDrive
    if (isOneDrive === 'True') {
        const OneDriveParentReferenceId = drive.OneDriveParentReferenceId
        const shareOneDrive = await sharedrive.sendEmailOneDrive(email, id, OneDriveParentReferenceId)
        if (shareOneDrive.value) {
            const orderItem = await db.orderItem.findOne({
                where: {
                    id: idOrder
                },
                include: {
                    model: db.course,
                }
            })

            orderItem.status = 'Da gui'
            orderItem.driveDaGui = shareOneDrive.value[0].link.webUrl
            orderItem.isOneDrive = true
            await orderItem.save()
            await db.course.update({
                sharelinkfree: shareOneDrive.value[0].link.webUrl
            }, {
                where: {
                    id: orderItem.course.id
                },

            })

            const [driveCourse, created] = await db.driveCourse.findOrCreate({
                where: {
                    idCourse: orderItem.course.id,
                },
                defaults: {
                    name: drivename,
                    idDrive: id,
                    isOneDrive: true,
                    OneDriveParentReferenceId: OneDriveParentReferenceId

                }

            })
            if (!created) {
                db.driveCourse.update({
                    name: drivename,
                    idDrive: id,
                    isOneDrive: true,
                    OneDriveParentReferenceId: OneDriveParentReferenceId
                }, {
                    where: {
                        idCourse: orderItem.course.id,
                    },
                })
            }
            return { status: 200, text: 'Gửi Mail thành công', email }

        } else {
            return { status: false, text: 'Gửi Mail không thành công', email }
        }
    } else {
        const resGGDrive = await sharedrive.sendgdrive(email, id)
        console.log(resGGDrive)
        //Update Order Item
        if (resGGDrive.statusText == 'OK') {
            const orderItem = await db.orderItem.findOne({
                where: {
                    id: idOrder
                },
                include: {
                    model: db.course,
                }
            })

            orderItem.status = 'Da gui'
            orderItem.driveDaGui = id
            await orderItem.save()
            await db.course.update({
                sharelinkfree: `https://drive.google.com/drive/folders/${id}?usp=drive_link`
            }, {
                where: {
                    id: orderItem.course.id
                },

            })
            const [driveCourse, created] = await db.driveCourse.findOrCreate({
                where: {
                    idCourse: orderItem.course.id,
                },
                defaults: {
                    name: drivename,
                    idDrive: id,
                    isOneDrive: false,
                }

            })

            if (!created) {
                db.driveCourse.update({
                    name: drivename,
                    idDrive: id,
                    isOneDrive: false,
                    OneDriveParentReferenceId: ''
                }, {
                    where: {
                        idCourse: orderItem.course.id,
                    },
                })
            }

            return { status: resGGDrive.status, text: 'Gửi Mail thành công', email, role: resGGDrive.config.data.role, driveCourse: driveCourse }
        } else {
            return { status: false, text: resGGDrive.response.statusText }
        }
    }
    //send Email

}

const createCourse = async (name, url, slug, price, priceus, priceindia, topicId, whatyouwilllearn, requirements, description, description_log, image, drivecoursename, drivecourID, isOneDrive, OneDriveParentReferenceId) => {
    const converJsonwhatyouwilllearn = JSON.parse(whatyouwilllearn)
    const converJsonwhatrequirements = JSON.parse(requirements)

    const newCourse = await db.course.create({
        name, url, slug, price, priceus, priceindia, whatyouwilllearn: converJsonwhatyouwilllearn, requirements: converJsonwhatrequirements, description, description_log, image,
        driveCourses: [
            {
                name: drivecoursename,
                idDrive: drivecourID,
                isOneDrive: isOneDrive,
                OneDriveParentReferenceId: OneDriveParentReferenceId
            }
        ]
    }, {
        include: [{ model: db.Topic }, { model: db.driveCourse }]
    })
    await newCourse.setTopics(topicId)
    return newCourse
}

const update = async (id, name, url, slug, price, priceus, priceindia, TopicId, whatyouwilllearn, requirements, description, description_log, image, sharelinkfree) => {
    console.log('update',TopicId)
    const converJsonwhatyouwilllearn = JSON.parse(whatyouwilllearn)
    const converJsonwhatrequirements = JSON.parse(requirements)
    const course = await db.course.findOne({ where: { id } })
    const updateCourse = await db.course.update({
        id, name, url, slug, TopicId, price, priceus, priceindia, whatyouwilllearn: converJsonwhatyouwilllearn, requirements: converJsonwhatrequirements, description, description_log, image, sharelinkfree
    }, {
        where: {
            id
        }, include: { model: db.Topic }

    })
    await db.course_topic.destroy({where: {
        course_id: id
    }})

    let parentTopic = await ulltil.getTopicWithParents(TopicId)
    parentTopic = [...parentTopic.parents.map(item => item.id),TopicId]

    await course.setTopics(parentTopic)

    return updateCourse
}

const addDriveToCourse = async (id, DriveName, DriveID, isOnedrive, OneDriveParentReferenceId) => {
    const course = await db.course.findOne({ where: { id } })
    course.sharelinkfree = ! isOnedrive ? `https://drive.google.com/drive/folders/${DriveID}?usp=sharing` : ''
    await course.save()
    await course.createDriveCourse({ name: DriveName, idDrive: DriveID, isOneDrive: isOnedrive, OneDriveParentReferenceId: OneDriveParentReferenceId })
    return course
}
const removeDriveToCourse = async (id, iddrive) => {
    const course = await db.driveCourse.destroy({
        where: {
            id: iddrive
        }
    })
    return course
}

const deleteCourse = async (id) => {
    const courses = await db.course.findOne({ where: { id } })
    await courses.setDriveCourses([])
    await courses.setOrderItems([])
    await courses.setRatings([])
    await courses.setBlogs([])
    await courses.setTopics([])
    await courses.destroy()
}

const findManyApi = async (text) => {
    const query = {
        order: [['id', 'DESC']],
        attributes: ['image', 'id', 'name', 'url', 'slug', 'price', 'originprice', 'description']
    }
    if (text) {
        query['where'] = {
            [Op.or]: [
                { name: { [Op.like]: `%${text}%` } },
                { url: text },
                { slug: { [Op.like]: `%${text}%` } }
            ]
        }
    }

    return await db.course.findAll(query)
}

module.exports = {
    findManyApi,findManyCourseTopicV2,
    createCourse, oneCourseLink, createNewCourse, oneCourseID, deleteCourse, findManyCourse_ChuaGui, findMany, oneCourseSlug, findManyCourseTopic, update, promiseCourse, addDriveToCourse, removeDriveToCourse
};