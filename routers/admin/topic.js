const Routers = require("express").Router();
const topic = require("../../controllers/topic")

Routers.get('/', topic.allTopicShow)
Routers.post('/', topic.createTopic)
Routers.get('/create', topic.createTopicView)

Routers.patch('/:id', topic.updateTopic)
Routers.delete('/:id', topic.deleteTopic)


module.exports = Routers;
