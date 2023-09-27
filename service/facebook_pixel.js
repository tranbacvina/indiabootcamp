const axios = require('axios')
const crypto = require('crypto');
function sha256(input) {
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
}

const access_token = 'EAASsyRHsm0sBOZCFGGCRZBsMUrZCRA9nSge7eNjyGEZAWPEvZCUztWWA4uWWfERy4lf7Bg57GyhZB3pOGEYHhR6pm5cpEYkr33fZClb5yEH87FC6E8LNG7mCM8N2KSUBy8S6pDo1ZAkXVbSJXJ52EhTxZBTlBRhMpglsUDhZCK984IHF6oUkRflfIKeq1xLqxzxkQGXgZDZD';
const pixel_id = '704457201605603';

const newEvenSendToFacebook = async (email, price, ipClien, client_user_agent) => {
    try {
        let current_timestamp = Math.floor(new Date() / 1000);
        const response = await axios.post(
            `https://graph.facebook.com/v13.0/${pixel_id}/events?access_token=${access_token}`,
            {
                data: [
                    {
                        "event_name": "Purchase",
                        "event_time": current_timestamp,
                        "action_source": "website",
                        "user_data": {
                            "em": sha256(email),
                            "client_ip_address": ipClien,
                            "client_user_agent": client_user_agent,
                        },

                        "custom_data": {
                            "currency": "VND",
                            "value": price
                        }
                    }
                ],
            }
        );
        console.log(response.data)
    } catch (error) {
        console.log(error.response.data)
    }


}

module.exports = { newEvenSendToFacebook }
