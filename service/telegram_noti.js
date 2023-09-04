const axios = require('axios')

const sendMessage = async (message, url) => {
    try {
        const postTelegram = await axios.post('https://api.telegram.org/bot5369452095:AAGluzPfKxXKngvYH5vOzAHCheSZgsO745Y/sendMessage',
        {
                reply_markup:{
                    inline_keyboard:[
                        [{text: 'Check Đơn Hàng', url:url}]
                    ]
                }
        },
        {
            params: {
                chat_id: 1046784418,
                text: message
            }
        })
    } catch (error) {
        console.log(error)
    }
}
const sendMessage2 = async (message) => {
    try {
        const postTelegram = await axios.post('https://api.telegram.org/bot5369452095:AAGluzPfKxXKngvYH5vOzAHCheSZgsO745Y/sendMessage',
        null,
       
        {
            params: {
                chat_id: 1046784418,
                text: message
            }
        })
    } catch (error) {
        console.log(error)
    }
}
module.exports = {sendMessage,sendMessage2}