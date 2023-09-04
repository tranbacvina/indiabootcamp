const { google } = require("googleapis");
const util = require("util");
const db = require("../models");
require('dotenv').config();
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

const findFolder = async name => {
  var name = name;
  name = name.replace(/\/|:|'|"|\-/g, "");
  try {
    const folder = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and fullText contains '${name}' and trashed = false`,
      fields:
        "nextPageToken, files(id, name)",
      orderBy: "modifiedTime desc",
    });
    // console.log(folder.data.files);
    return folder.data.files;
  } catch (error) {
    console.error(error);
  }
};

const findFolderAdmin = async name => {
  let serach = name.replace(/[<>:"\/\\|?*']+/g, '')
  try {
    const folder = await drive.files.list({
      q: `mimeType="application/vnd.google-apps.folder" and fullText contains "${serach}" and trashed = false`,
      fields:
        "nextPageToken, files(id, name,owners)",
      orderBy: "modifiedTime desc",
    });
    // console.log(folder.data.files);
    return folder.data.files;
  } catch (error) {
    console.error(error);
  }
};

const shareFolder = async (email, fileID) => {
  try {
    var permissions = {
      type: "user",
      role: "reader",
      emailAddress: `${email}`,
    };
    const share = await drive.permissions.create({
      resource: permissions,
      fileId: fileID,
    });
    return share
  } catch (error) {
    console.log(error)
    return (error)
  }

};



module.exports = {
  findFolder,
  shareFolder,
  findFolderAdmin
};
