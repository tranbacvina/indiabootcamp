const paginate = require('express-paginate');
const db = require("../models");
const axios = require("axios");

const { Op } = require("sequelize");
const sharedrive = require("../service/sharedrive")

const oneCourseLink = async (link) => {
    const course = await db.course.findOne({
        where: {
            url: link,
        },
    });
    return course
}
const oneCourseID = async (id) => {
    return await db.course.findOne({
        where: {
            id
        },
        include: { model: db.driveCourse }
    });
}

const createNewCourse = async (name, url, description, image, price, is_practice_test_course) => {
    const course = await db.course.create(
        {
            name,
            url,
            description,
            image,
            price,
            is_practice_test_course,
        },
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
const findMany = async (text, limit, skip) => {
    const query = { limit: limit, offset: skip, order: [['id', 'DESC']] }
    if (text) {
        query['where'] = {
            [Op.or]: [

                { name: { [Op.like]: `%${text}%` } },
                { url: text }
            ]
        }
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
module.exports = {
    oneCourseLink, createNewCourse, oneCourseID, findManyCourse_ChuaGui, findMany, promiseCourse
};