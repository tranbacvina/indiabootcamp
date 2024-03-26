const Routers = require("express").Router();
const serviceController = require("../controllers/service")
const db = require("../models")
const topic = require("../service/topic")
const courseService = require("../service/course")
const schema = require('../service/schema')
const ulltilService = require ('../service/ulltil')

Routers.get("/",  async (req, res) => {
    try {
        const { text,} = req.query
        const page = req.query.page || 1
        const slug = 'service'
        
        console.log(req.baseUrl)

        const results = await Promise.all([topic.findOne(slug),  courseService.findManyCourseTopicV2(text, page, slug)])

        const topicOne = results[0]

        if (!topicOne) {
            res.redirect('/404')
            return
        }
        
        let course = results[1]

        // if(course.count == 0) {
        //     await topic.removeTopic(topicOne.id)
        //     res.redirect('/404')
        //     return
        // }

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
        res.render("service/servicesAll", {
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

})

Routers.get("/:slug",serviceController.oneService)

module.exports = Routers