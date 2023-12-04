const Routers = require("express").Router();
const MediaConTroller = require('../../controllers/media')
const upload = require('../../controllers/upload')

Routers.post('/blogpostmedia',upload.single('file'), MediaConTroller.upload)

module.exports = Routers