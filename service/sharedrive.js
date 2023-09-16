// const mbbank = require("./mbbank");
const db = require("../models");
const drive = require("./googledrive");
const botTelegram = require("./telegram_noti");
const axios = require("axios");

// const { sendEmailOneDrive, sendgdrive } = require("./cawn_data");

const sendEmailOneDrive = async (email, fileID, OneDriveParentReferenceId) => {

  try {
    const sendEmail = await axios.post(`${process.env.API_CHECK_COURSE}/sendonedrive`, {
      email, fileID, OneDriveParentReferenceId
    })
    console.log(sendEmail.data)
    return sendEmail.data
  } catch (error) {
    console.log(error)
    return error
  }
}

const sendgdrive = async (email, fileID) => {

  try {
    const sendEmail = await axios.post(`${process.env.API_CHECK_COURSE}/sendgdrive`, {
      email, fileID
    })
    return sendEmail.data
  } catch (error) {
    console.log(error)
    return error
  }
}

const shareDriveViaOrder = async (id) => {
  try {
    const OrderItem = await db.order.findOne({
      where: {
        id,
      },
      include: {
        model: db.orderItem,
        include: {
          model: db.course,
          include: {
            model: db.driveCourse,
          },
        },
      },
    });
    const email = OrderItem.email;

    for (let orderItem of OrderItem.orderItems) {
      if (orderItem.course.driveCourses.length > 0) {
        if (orderItem.status == "Chua gui") {
          const driveID = orderItem.course.driveCourses[0].idDrive;
          const OneDriveParentReferenceId = orderItem.course.driveCourses[0].OneDriveParentReferenceId;
          const IdOrderItem = orderItem.id;

          if (orderItem.course.driveCourses[0].isOneDrive) {
            const shareOneDrive = await sendEmailOneDrive(email, driveID, OneDriveParentReferenceId)
            const UpdateItemOrder = await db.orderItem.findOne({
              where: {
                id: IdOrderItem,
              },
            });

            UpdateItemOrder.status = "Da gui";
            UpdateItemOrder.driveDaGui = shareOneDrive.value[0].link.webUrl
            UpdateItemOrder.isOneDrive = true
            await UpdateItemOrder.save();
          }
          else {
            await sendgdrive(email, driveID);

            const UpdateItemOrder = await db.orderItem.findOne({
              where: {
                id: IdOrderItem,
              },
            });

            UpdateItemOrder.status = "Da gui";
            UpdateItemOrder.driveDaGui = driveID;
            await UpdateItemOrder.save();
          }
        }
      } else {
        await botTelegram.sendMessage2(`${orderItem.course.url}`);
      }
    }
  } catch (error) {
    console.log(error);
  }
};


module.exports = {
  shareDriveViaOrder, sendEmailOneDrive, sendgdrive
};
