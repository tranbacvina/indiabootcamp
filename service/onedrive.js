const msal = require('@azure/msal-node')
const axios = require('axios')

const clientConfig = {
    auth: {
        clientId: "85ffe4b1-5ce2-4529-84de-2b4ef993d87b",
        authority: "https://login.microsoftonline.com/common/",
        clientSecret: "DlL8Q~S1hjnckLx-wRQ0Nd6eBN2R9la8c1s1lb5F",
    },

};
const pca = new msal.PublicClientApplication(clientConfig);


const loginRequest = {
    deviceCodeCallback: (response) => (console.log(response.message)),
    scopes: ["user.read"],
};



pca.acquireTokenByDeviceCode(loginRequest).then((response) => {
    console.log(JSON.stringify(response));
}).catch((error) => {
    console.log(JSON.stringify(error));
});


const acquireToken = async () => {
    const accounts = await pca.getAllAccounts();

    console.log(accounts)
    if (accounts.length === 1) {
        const silentRequest = {
            account: accounts[0],
            scopes: ["User.Read"]
        }

        return await pca.acquireTokenSilent(silentRequest).catch(e => {
            if (e instanceof InteractionRequiredAuthError) {
                return pca.acquireTokenByDeviceCode(loginRequest)
            }

            throw e;
        });
    } else if (accounts.length > 1) {
        accounts.forEach(account => {
            console.log(account.username);
        });
        return Promise.reject("Multiple accounts found. Please select an account to use.");
    } else {
        return pca.acquireTokenByDeviceCode(loginRequest);
    }
}



const findFolder = async (text) => {
    const query = text.replace(/[<>:"\/\\|?*.#&']+/g, '')
    const texts = encodeURI(query)

    return acquireToken().then(async (response) => {
        const data = await axios.get(`https://graph.microsoft.com/v1.0/me/drive/search(q='{${texts}}')?select=id,name,createdDateTime,createdBy,parentReference,webUrl`, { headers: { "Authorization": `Bearer ${response.accessToken}` } })
        // const OneDrive = data.data.value.filter(item => item.name === query)
        const OneDrive = data.data.value

        return OneDrive
    }).catch(e => {
        console.error(e);
    });
}

const findFolderv2 = async (text) => {
    const query = text.replace(/[<>:"\/\\|?*.#&']+/g, '')

    return acquireToken().then(async (response) => {
        const data = await axios.post(`https://graph.microsoft.com/v1.0//search/query`,

            {
                "requests": [
                    {
                        "entityTypes": [
                            "driveItem"
                        ],
                        "query": {
                            "queryString": query
                        }
                    }
                ]
            }, { headers: { "Authorization": `Bearer ${response.accessToken}` } },)
        const total = data.data.value[0].hitsContainers[0].total
        if (total >= 1) {
            return data.data.value[0].hitsContainers[0].hits.filter(item => item.resource.name === query)
        }
        else {
            return []

        }
    }).catch(e => {
        console.error(e);
    });
}

const sendEmailOneDrive = async (email, fileID, OneDriveParentReferenceId) => {

    return acquireToken().then(async (response) => {
        const options = {
            headers: { "Authorization": `Bearer ${response.accessToken}` }
        }

        const data = {
            "requireSignIn": true,
            "sendInvitation": true,
            "roles": ["read"],
            "recipients": [
                { "email": email },
            ],
            "message": "Chào bạn, Full Bootcamp xin gửi bạn File khoá học!. Chúc bạn học tập tốt"
        }
        const sendMail = await axios.post(`https://graph.microsoft.com/v1.0/drives/${OneDriveParentReferenceId}/items/${fileID}/invite`, data, options)
        return sendMail.data
    }).catch(e => {
        console.error(e);
    });
}

module.exports = { findFolderv2, findFolder, sendEmailOneDrive }