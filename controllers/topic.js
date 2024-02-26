const topic = require("../service/topic")
const courseService = require("../service/course")
const paginate = require('express-paginate');
const ulltilService = require ('../service/ulltil')
const db = require("../models");
const { where } = require("sequelize");
const schema = require('../service/schema')

const allTopicShow = async (req, res) => {
    const fetTopicData = await topic.findAll()
    const rows = JSON.parse(JSON.stringify(fetTopicData, null, 2));
    const topics = await ulltilService.handlerTopic(rows, 0);
   
    // res.send(topics)
    res.render('admin/topics/topics', { topics })
}

const createTopicView = async (req, res) => {
    res.render('admin/topics/create')
}
const editTopicView = async (req, res) => {
    const {id} = req.params
    const topics = await db.Topic.findAll()
    const topic = await db.Topic.findOne({where:{id}})

    const rows = JSON.parse(JSON.stringify(topics, null, 2));
    const handlerTopic = await ulltilService.handlerTopic(rows, 0);

    const dropDownHandTopic = await ulltilService.dropDownHandTopic(handlerTopic,0,topic.parent_id)

    res.render('admin/topics/edit',{topic,topics,dropDownHandTopic})
}
const updateTopic = async (req, res) => {
    const topicID = req.params.id
    
    try {
        const update = await topic.update(req.body,topicID)
        
        res.redirect(`/admin/topic/${topicID}`)
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            data: 'Internal Server Error'
        })
    }
}

const createTopic = async (req, res) => {
    try {
        const { name, slug, seotitle, seodescription } = req.body
        console.log(name, slug, req.body)

        const newTopic = await db.Topic.create({
            name, slug, seotitle, seodescription
        })
        console.log(newTopic)
        res.redirect(`/admin/topic/`)
    } catch (error) {
        res.status(500).send({
            success: false,
            data: 'Internal Server Error'
        })
    }
}

const deleteTopic = async (req, res) => {
    const id = req.params.id
    try {
        const topic =await db.Topic.findOne({where: {id}})
        await topic.setCourses([])
        await db.Topic.destroy({ where: { id } })

        return res.status(200).json({
            success: true,
            data: 'Topic removed'
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: error
        })
    }
}

const topicSlugGetCourses = async (req, res) => {
    try {
        const { text,} = req.query
        const page = req.query.page || 1
        const { slug } = req.params
        
        console.log(req.baseUrl)

        const results = await Promise.all([topic.findOne(slug),  courseService.findManyCourseTopicV2(text, page, slug)])

        const topicOne = results[0]

        if (!topicOne) {
            res.redirect('/404')
            return
        }
        
        let course = results[1]

        if(course.count == 0) {
            await topic.removeTopic(topicOne.id)
            res.redirect('/404')
            return
        }

        course = JSON.parse(JSON.stringify(course, null, 2))
        course.rows = course.rows.map(item => {
            return { ...item, ratings: ulltilService.calculateStats(item.ratings)}
        })
        const schemaCourses = schema.createStrucDataCourses(course.rows)
        
        
        const childtopicBreacumn = await Promise.all([topic.findAllTopicChild(topicOne.id),ulltilService.getTopicWithParents(topicOne.id)])
        let childTopics = childtopicBreacumn[0]
        const breadcrumb = childtopicBreacumn[1]

        const schemaBreadcum = schema.breadcumbCourseTopic(breadcrumb)
    
            
        const itemCount = course.count;
        const pageCount = Math.ceil(itemCount / 36);
        const url= `${req.baseUrl}${req.path}?page=`
        const pages = ulltilService.pagination(req.query.page, pageCount, url); 
        res.render("course/course", {
            course: course.rows,
            topicOne,
            childTopics,
            pageCount,
            itemCount,
            currentPage: req.query.page,
            breadcrumb,
            schemaBreadcum,schemaCourses,
            pages: pages,
        });
    } catch (error) {
        console.log(error)
        res.status(500).render('layout/505')
    }

}

const topicSlugGetCoursesV2 = async (req, res) => {
    const { slug } = req.params
    const page = req.query.page || 1
    const limit = 10
    const skip = (limit * page) - limit
    console.log(req.baseUrl,req.path)
    const courses = await db.course.findAndCountAll({

        limit,
        offset: skip,
        where:{
            'is_practice_test_course': false

        },
        include:{
            model: db.Topic,
            where: {
                slug,
            }
        },
        order:[['updatedAt', 'DESC']],
        attributes: ['id','name','slug', 'is_practice_test_course','description','image','price','originprice','updatedAt']
    })
    const itemCount = courses.count;
    const pageCount = Math.ceil(itemCount / req.query.limit);
    const pages = []
    for (let i = 1; i<pageCount; i ++) {
        pages.push({
            number: i,
            url: `${req.baseUrl}${req.path}?page=${i}`
        })
    }
    res.send(courses.rows)
}
module.exports = {topicSlugGetCoursesV2, createTopic, allTopicShow, deleteTopic, updateTopic, createTopicView, topicSlugGetCourses,editTopicView }