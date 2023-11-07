const axios = require('axios')
const crypto = require('crypto');
function sha256(input) {
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
}

const access_token = 'EAASsyRHsm0sBO4rzmZBsAE19TOKVCCZBPfMKJFfm924CpPDykdPAsAZC8GtUL6XzZB8GXNKphtTfOXJwZCLWWREG0EOIho3fgeefEmPAnIHMBfH26s2L6hGhp3NVL2xIcjwUjf2e8rvbTx6TMBZB7AdeVlTZCkKVs3tfPjErWEEpfp4uZAZCxHCRnmtHe9Ufix3ypMgZDZD';
const pixel_id = '117401864799926';

const newEvenSendToFacebook = async (email, price, ipClien, client_user_agent, fbc, fbp) => {
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
                            fbc, fbp
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
