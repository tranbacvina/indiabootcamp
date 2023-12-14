const serviceBlog = require("../service/blog")
const catgoriesServices = require("../service/catgories")
const paginate = require('express-paginate');
const serviceCategories = require("../service/catgories")
const db = require("../models");
const schema = require('../service/schema')
const mediaService = require("../service/media")

const allBlogAdmin = async (req, res) => {
    const { text, limit, } = req.query
    const query = {
        limit: limit,
        offset: req.query.skip,
        order: [['id', 'DESC']],
        include: { model: db.Category },
    }
    if (text) {
        query['where'] = {
            [Op.or]: [

                { name: { [Op.like]: `%${text}%` } },
                { url: text }
            ]
        }
    }
    const blogs = await db.Blog.findAndCountAll(query)
    if (blogs.length === 0) {

        res.render('layout/404')
    } else {
        const itemCount = blogs.count;
        const pageCount = Math.ceil(blogs.count / req.query.limit);
        res.render('admin/blog', {
            blogs: blogs.rows,
            pageCount,
            itemCount,
            currentPage: req.query.page,
            pages: paginate.getArrayPages(req)(10, pageCount, req.query.page),
        });

    }
};

const viewUpdate = async (req, res) => {
    const id = req.params.id
    try {
        const blog = await serviceBlog.findOne(id)
        const categories = await serviceCategories.findAll()
        if (!blog) {
            return res.render('layout/404')
        }
        return res.render('admin/blog/edit', {
            blog,
            categories,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: 'Internal Server Error'
        })
    }
}

const postUpdate = async (req, res) => {
    console.log(req.body)
    const id = req.params.id
    let {
        title,
        description,
        slug,
        keywords,
        content,
        categoryId,
        statusId, thumbnailSlug,
        courses
    } = req.body
    if (categoryId == 'null') {
        categoryId = null
    }
    try {
        let data = {
            title,
            content,
            description: description,
            slug,
            keywords,
            thumbnail: thumbnailSlug,
            categoryId,
            isDeleted: statusId,
        }

        if (req.file) {
            const filename = req.file.filename;
            const fileUrl = `/uploads/${filename}`
            const createthumbnail = await mediaService.createMedia(filename, fileUrl)
            data.thumbnail = createthumbnail.fileUrl
        }

        const updateBlog = await db.Blog.update(data, { where: { id } })

        if (courses.length > 0) {
            courses = JSON.parse(courses).map(item => item.id)
            const course = await db.Blog.findOne({ where: { id } })
            await course.setCourses(courses)
        }


        return res.status(200).json({
            success: true,
            data: 'Blog updated'
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error
        })
    }

}

const viewCreate = async (req, res) => {
    try {
        const categories = await serviceCategories.findAll()

        return res.render('admin/blog/create', {
            categories
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: 'Internal Server Error'
        })
    }
}

const create = async (req, res) => {

    console.log(req.body)
    let {
        title,
        description,
        slug,
        content,
        categoryId,
        statusId,
        courses,
        thumbnailSlug
    } = req.body
    try {
        let thumbnail = thumbnailSlug
        if (categoryId == 'null') categoryId = null

        if (req.file) {
            const filename = req.file.filename;
            const url = `/uploads/${filename}`;
            thumbnail = await mediaService.createMedia(filename, url).fileUrl
        }

        const newblog = await db.Blog.create({
            title,
            description: description, slug,
            content,
            thumbnail,
            categoryId,
            isDeleted: statusId,
            courses
        },
            {
                include: [{
                    model: db.Category,

                },
                { model: db.course }]
            })
        return res.status(201).send({ success: true, message: `Tạo Blog ${title} thành công`, data: newblog })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: error,
            message: error
        })
    }
}
const remove = async (req, res) => {
    const id = req.params.id

    try {

        await db.Blog.destroy({ where: { id } })

        return res.status(200).json({
            success: true,
            data: 'Blog removed'
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: 'Internal Server Error'
        })
    }
}

const oneBlogPublic = async (req, res) => {
    const slug = req.params.slug
    const blog = db.Blog.findOne({
        where: {
            slug,
            isDeleted: false

        },
        include: [{
            model: db.Category
        }, { model: db.course, attributes: ['id', 'image', 'name', 'slug', 'originprice', 'price'] }]
    })
    const coursesLienquan = db.course.findAll({ limit: 4, order: [['id', 'DESC']], });
    const results = await Promise.all([blog, coursesLienquan])
    if (results[0]) {
        const schemaBreadcum = schema.schemaBlog(results[0])
        const schemablog = schema.blogPage(results[0])

        res.render('blog/one-blog', { blog: results[0], schemablog, schemaBreadcum, coursesLienquan: results[1] })
    }
    else {
        res.render('layout/404')
    }
}

const allBlogPublic = async (req, res) => {
    const { text, limit, } = req.query
    const blogs = await serviceBlog.findMany(text, limit, req.skip)
    if (blogs.length === 0) {

        res.render('layout/404')
    } else {
        const itemCount = blogs.count;
        const pageCount = Math.ceil(blogs.count / req.query.limit);
        res.render('blog/all', {
            blogs: blogs.rows,
            pageCount,
            itemCount,
            currentPage: req.query.page,
            pages: paginate.getArrayPages(req)(10, pageCount, req.query.page),
        });

    }
};

const lienhe = async (req, res) => {
    res.render('blog/lienhe')
}
const gioithieu = async (req, res) => {
    const blog = await db.Blog.findOne({
        where: {
            slug: 'gioi-thieu'

        },

    })
    if (blog) {
        res.render('blog/page', { blog: blog, })
    }
    else {
        res.render('layout/404')
    }
}
const chinhsachbaomat = async (req, res) => {
    const blog = await db.Blog.findOne({
        where: {
            slug: 'chinh-sach-bao-mat'

        },

    })
    if (blog) {
        res.render('blog/page', { blog: blog, })
    }
    else {
        res.render('layout/404')
    }
}
module.exports = { lienhe, oneBlogPublic, allBlogAdmin, viewUpdate, postUpdate, viewCreate, create, remove, allBlogPublic, gioithieu, chinhsachbaomat }