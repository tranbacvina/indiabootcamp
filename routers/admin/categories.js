const Routers = require("express").Router();
const categories = require("../../controllers/categories")

Routers.get('/', categories.allcategoriesShow)
Routers.post('/', categories.createTopic)
Routers.get('/create', categories.createCategoriesView)

Routers.patch('/:id', categories.updateTopic)
Routers.delete('/:id', categories.deleteTopic)


module.exports = Routers;
