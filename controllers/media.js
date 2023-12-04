const db = require("../models")
const serviceMedia = require("../service/media")
const upload = async (req,res) => {
    try {
        if(req.file.mimetype){
            const thumbnail = await serviceMedia.createMedia(req.file.filename,`/uploads/${req.file.filename}`)
            res.status(200).send({ "location": `/uploads/${req.file.filename}` })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
  
}
module.exports = {upload}