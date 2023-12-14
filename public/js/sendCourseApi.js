
const modalSendCourse = new tingle.modal({
    footer: true,
    stickyFooter: true
})

modalSendCourse.addFooterBtn('Gửi mail', 'button -md -purple-1 text-white tingle-btn--pull-left', async function () {
    const drives = []
    const inputs = document.querySelectorAll(".checkfileduocchon:checked");
    for (let input of inputs) {
        const id_Drive = input.value;
        const idorderItems = input.getAttribute("idorderItems")
        const drivename = input.getAttribute("drivename")
        const email = input.getAttribute("email");
        const isOneDrive = input.getAttribute("isOneDrive");
        const OneDriveParentReferenceId = input.getAttribute("OneDriveParentReferenceId")
        drives.push({ id_Drive, email, idorderItems, drivename, isOneDrive, OneDriveParentReferenceId })
    }
    console.log(drives)
    const sendApiCourse = await axios.post('/admin/course/sendEmailCourse', {
        drives
    })
    console.log(sendApiCourse.data)
    for (let item of sendApiCourse.data) {
        if (item.status == 200) {
            toastr.success(`${item.text}`);
        } else {
            toastr.error(`${item.text}`);
        }
    }
});
modalSendCourse.addFooterBtn('Huỷ', 'button -md -purple-3 text-purple-1 tingle-btn--pull-right', function () {
    modalSendCourse.close();
});

const checkcourse = async (e) => {
    const orderID = e.getAttribute("orderID")
    modalSendCourse.open()
    modalSendCourse.setContent('Đang lấy dữ liệu');
    const URIapi = orderID ? `/admin/course/cawncoursechuagui?id=${orderID}` : '/admin/course/cawncoursechuagui'
    const dataCourseChuaGui = await axios.get(URIapi)

    let codeHtml = ``
    for (let item of dataCourseChuaGui.data) {

        const renderGoogleOneDrive = renderGoogleOneDriveFC(item.cawnData.OneDrive, item.cawnData.DriveFolder, item.orderData.order.email, item.orderData.id)
        const html = `
                        <div class="py-20">
                            <div class="text-20 lh-1 text-purple-1 fw-500 mb-15">${item.cawnData.courseDB.title}</div>
                            <div class="text-18 mb-30">${item.cawnData.courseDB.url}</div>
                            <div id="renderDriveItems">
                                ${renderGoogleOneDrive}
                            </div>

                        </div>
                    `
        codeHtml += html
    }
    modalSendCourse.setContent(codeHtml);

}

const checkcoursebyname = async (e) => {
    const orderID = e.getAttribute("orderID")
    modalSendCourse.open()
    modalSendCourse.setContent('Đang lấy dữ liệu');
    const URIapi = orderID ? `/admin/course/cawnnamecoursechuagui?id=${orderID}` : '/admin/course/cawnnamecoursechuagui'
    const dataCourseChuaGui = await axios.get(URIapi)

    let codeHtml = ``
    for (let item of dataCourseChuaGui.data) {

        const renderGoogleOneDrive = renderGoogleOneDriveFC(item.cawnData.OneDrive, item.cawnData.DriveFolder, item.orderData.order.email, item.orderData.id)
        const html = `
                        <div class="py-20">
                            <div class="text-20 lh-1 text-purple-1 fw-500 mb-15">${item.orderData.course.name}</div>
                            <div class="text-18 mb-30">${item.orderData.course.url}</div>
                            <div id="renderDriveItems">
                                ${renderGoogleOneDrive}
                            </div>

                        </div>
                    `
        codeHtml += html
    }
    modalSendCourse.setContent(codeHtml);

}

const renderGoogleOneDriveFC = (OneDrives, DriveFolders, email, orderIdItemChuaGui) => {
    var renderDriveItems = ``
    for (let OneDrive of OneDrives) {
        const html = `
                        <div class="d-flex items-center py-15">
                            <div class="form-checkbox">
                                  <input type="checkbox" onedriveparentreferenceid="${OneDrive.resource.parentReference.driveId}" drivename="${OneDrive.resource.name}" id="${OneDrive.resource.id}" value="${OneDrive.resource.id}" isonedrive="True" email="${email}" idorderitems="${orderIdItemChuaGui}" class="form-check-input checkfileduocchon">
                            <div class="form-checkbox__mark">
                                <div class="form-checkbox__icon icon-check"></div>
                            </div>
                            </div>
                                <div class="d-flex flex-column">
                                        <label for="${OneDrive.resource.id}" class="text-16 lh-12 text-white ml-15  p-15 bg-orange-4">${OneDrive.resource.name} </label>
                                    <a target="_blank"  href="${OneDrive.resource.webUrl}">
                                    </a>
                                        <div class="text-14 lh-12 text-dark-1 ml-15 py-5">${OneDrive.resource.id} </div>
                                        <div class="text-14 lh-12 text-dark-1 ml-15  py-5">${moment(OneDrive.resource.createdDateTime).format("DD-MM-YYYY")}  - <span class="text-purple-4"> Onedrive - ${OneDrive.resource.createdBy.user.displayName}</span></div>
                                </div>
                        </div>
                    `
        renderDriveItems += html
    }
    for (let DriveFolder of DriveFolders) {
        const html = `
                            <div class="d-flex items-center">
                                <div class="form-checkbox">
                                    <input type="checkbox" onedriveparentreferenceid="" drivename="${DriveFolder.name}" id="${DriveFolder.id}"
                                        value="${DriveFolder.id}" isonedrive="False" email="${email}" idorderitems="${orderIdItemChuaGui}"
                                        class="form-check-input checkfileduocchon">
                                    <div class="form-checkbox__mark">
                                        <div class="form-checkbox__icon icon-check"></div>
                                    </div>
                                </div>
                                <div class="d-flex flex-column">
                                        <label class="text-16 lh-12 ml-15 p-15 bg-orange-4 text-white" for="${DriveFolder.id}">${DriveFolder.name} </label>
                                    <a href="https://drive.google.com/drive/folders/${DriveFolder.id}?usp=sharing">
                                        <div class="text-14 lh-12 text-dark-1 ml-15 py-5">${DriveFolder.id}</div>
                                        <div class="text-14 lh-12 text-dark-1 ml-15 py-5">${moment(DriveFolder.createdTime).format("DD-MM-YYYY")} -
                                            <span class="text-blue-3"> GoogleDrive -
                                                ${DriveFolder.owners[0].displayName} </span>
                                        </div>
                                    </a>
                                </div>
                            </div>
                    `
        renderDriveItems += html
    }
    return renderDriveItems

}

const downloadAllCourse = async (e) => {
    const URI = 'https://udemy.fullbootcamp.com/'
    const id = e.getAttribute("idOrder")
    let links = await axios.get(`/admin/order/needdowwnload/${id}`)
    links = links.data
    console.log(links)
    const data = await axios.post(URI, {
        links
    })
    const items = data.data
    alert(items)
}

const downloadAllCoursev2 = async (e) => {
    const URI2 = 'https://udemy.fullbootcamp.com/nonbussines'
    const id = e.getAttribute("idOrder")
    let links = await axios.get(`/admin/order/needdowwnload/${id}`)
    links = links.data

    const data = await axios.post(URI2, {
        links
    })
    const items = data.data
    toastr.success(items);
}

const downloadAllCoursev3 = async (e) => {
    const URI2 = 'https://udemy.fullbootcamp.com/3'
    const id = e.getAttribute("idOrder")
    let links = await axios.get(`/admin/order/needdowwnload/${id}`)
    links = links.data

    const data = await axios.post(URI2, {
        links
    })
    const items = data.data
    toastr.success(items);

}

const downloadAllCoursev4 = async (e) => {
    const URI2 = 'https://udemy.fullbootcamp.com/4'
    const id = e.getAttribute("idOrder")
    let links = await axios.get(`/admin/order/needdowwnload/${id}`)
    links = links.data

    const data = await axios.post(URI2, {
        links
    })
    const items = data.data
    toastr.success(items);

}