const catgoriesServices = require("../service/catgories")
const db = require("../models")
const blogService = require("../service/blog")
const paginate = require('express-paginate');
const schema = require("../service/schema")
const ultrilSevice = require('../service/ulltil')



const allcategoriesShow = async (req, res) => {
    const catgories = await catgoriesServices.findAll()
    res.render('admin/categories/categories', { catgories })
}

const createCategoriesView = async (req, res) => {
    res.render('admin/categories/create')
}

const updateTopic = async (req, res) => {
    const topicID = req.params.id
    const { topicName, topicSlug, seotitle, seodescription } = req.body
    try {
        await db.Category.update({
            name: topicName,
            slug: topicSlug,
            seotitle,
            seodescription
        }, {
            where: {
                id: topicID
            }
        })
        res.send({
            success: true,
            data: 'Cập nhật thành công'
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            data: 'Internal Server Error'
        })
    }
}

const createTopic = async (req, res) => {
    try {
        const { name, slug } = req.body
        console.log(name, slug, req.body)

        const newTopic = await db.Category.create({
            name, slug
        })
        console.log(newTopic)
        res.redirect(`/admin/categories/`)
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

        await db.Category.destroy({ where: { id } })

        return res.status(200).json({
            success: true,
            data: 'Category removed'
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: 'Internal Server Error'
        })
    }
}

const findAllBlogBySlugcatgories = async (req, res) => {
    // const { text, limit, } = req.query
    // const { slug } = req.params
    // const categorie = await catgoriesServices.findOne(slug)
    // console.log(categorie)
    // const blogs = await blogService.findManyByCategories(text, limit, req.skip, slug)
    // if (blogs.length === 0 | !categorie) {

    //     res.status(404).render('layout/404')
    //     return
    // } else {
    //     const schemaBreadcum = schema.breadcrumbBlogCate(categorie)

    //     const itemCount = blogs.count;
    //     const pageCount = Math.ceil(blogs.count / req.query.limit);
    //     // res.send({
    //     //     blogs: blogs.rows,
    //     //     pageCount,
    //     //     itemCount,
    //     //     currentPage: req.query.page,
    //     //     pages: paginate.getArrayPages(req)(10, pageCount, req.query.page),
    //     // })
    //     res.render('blog/category', {
    //         blogs: blogs.rows,
    //         categorie,
    //         pageCount,
    //         itemCount,
    //         currentPage: req.query.page,
    //         schemaBreadcum,
    //         pages: paginate.getArrayPages(req)(10, pageCount, req.query.page),
    //     });

    // }
    const { slug } = req.params
    const { text, } = req.query
    const page = req.query.page || 1
    const categorie = await catgoriesServices.findOne(slug)
    const blogs = await blogService.findMany(text,page, false, slug)
    if (blogs.length === 0) {

        res.render('layout/404')
    } else {
        const schemaBreadcum = schema.breadcrumbBlogCate(categorie)
        const itemCount = blogs.count;
        const pageCount = Math.ceil(itemCount / 36);
        let url= `${req.baseUrl}${req.path}`
        url = ultrilSevice.xoaDauSlashCuoiCung(url) + "?page="
        const pages = ultrilSevice.pagination(page, pageCount, url); 
        res.render('blog/category', {
            blogs: blogs.rows,
            categorie,
            pageCount,
            itemCount,
            currentPage: page,
            schemaBreadcum,
            pages: pages,
        });

    }
}
module.exports = { createTopic, allcategoriesShow, deleteTopic, updateTopic, createCategoriesView, findAllBlogBySlugcatgories }