const Routers = require("express").Router();
const controllersBlog = require("../../controllers/blog")
const upload = require('../../controllers/upload')

Routers.get('/', controllersBlog.allBlogAdmin)
Routers.post('/', upload.single('hinhdaidien'), controllersBlog.create)
Routers.get('/create', controllersBlog.viewCreate)

Routers.get('/:id', controllersBlog.viewUpdate)
Routers.patch('/:id', upload.single('hinhdaidien'), controllersBlog.postUpdate)
Routers.delete('/:id', controllersBlog.remove);

module.exports = Routers


