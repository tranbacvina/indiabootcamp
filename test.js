const cawn_data = require("./service/cawn_data_test")
const db =require('./models')
const { Op } = require("sequelize");
const main = async() => {
    // const links =[{'uri': 'https://gitiho.com/khoa-hoc/ebook-tuyet-dinh-excel-khai-pha-10-ky-thuat-ung-dung-excel-ma-dai-hoc-khong-day-ban', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/exg02-thu-thuat-excel-cap-nhat-hang-tuan-cho-dan-van-phong', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/exg01-tuyet-dinh-excel-tro-thanh-bac-thay-excel-trong-16-gio-2', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/vbag01-tuyet-dinh-vba-viet-code-trong-tam-tay', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/nhap-mon-excel-cung-gitiho-2', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/exg08-excel-cho-tai-chinh-ke-toan-va-phan-tich-tai-chinh', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/exg07-truc-quan-bao-cao-du-lieu-voi-bieu-do-do-thi-bang-excel-excel-data-visualization', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/exg05-ky-nang-su-dung-cong-thuc-va-ham-a-z-trong-excel', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/bcg01-xay-dung-he-thong-bao-cao-quan-tri-bang-excel', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/power-pivot-power-query-bien-excel-thanh-cong-cu-phan-tich-du-lieu-chuyen-sau-2', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/vbag02-ung-dung-mang-sql-va-cac-cong-cu-nang-cao-khac-trong-excel-va-vba-2', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/su-dung-gitiho-excel-add-in-de-tang-200-hieu-qua-lam-viec-tren-excel-2', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/exg04-ky-nang-bao-cao-tu-duy-to-chuc-du-lieu-tren-excel', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/exg06-xay-dung-add-in-the-lenh-quan-ly-cong-viec-tren-excel-2', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/pivot-table-pivot-chart-va-power-pivot-chuyen-sau-trong-excel-ung-dung-lam-dashboard-tao-mo-hinh-phan-tich-du-lieu-2', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/tung-buoc-co-ban-dung-file-cham-cong-bang-google-sheets', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/file-mau-phan-mem-quan-ly-kho-nhap-xuat-ton-bang-file-excel-2', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/mose-chinh-phuc-mos-excel-2013-cung-nimbus-2', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/thu-thuat-excel-cho-nguoi-ban-ron-kem-theo-zoom-hoi-dap-toi-thu-5-hang-tuan-2', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/zoom-record-cac-loai-bieu-do-hay-dung-trong-bao-cao-google-sheets', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/template-20-mau-bieu-do-excel-chuyen-nghiep-2', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/phim-tat-trong-word-excel-power-point-va-tips-de-tang-toc-do-lam-viec-2', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/xay-dung-ung-dung-khong-can-code-voi-google-appsheet', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/bao-cao-tu-dong-keo-tha-voi-bang-tong-hop-pivot-table-tren-google-sheets-by-co-giang-xcel', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/tao-ung-dung-quan-ly-kho-tu-a-z-voi-google-appsheet', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/thanh-thao-bang-tinh-excel-365-tu-a-z', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/ms-excel-bieu-do-co-ban-de-truc-quan-du-lieu-2', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/ms-excel-dinh-dang-du-lieu-tu-co-ban-den-nang-cao', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/microsoft-excel-2013-co-ban-va-nang-cao-ung-dung-trong-thuc-tien-2', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/ms-excel-tim-kiem-loc-va-sap-xep-du-lieu', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/khoa-hoc-spreadsheet-tu-co-ban-den-nang-cao-trong-20-tieng', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/exg10-thanh-thao-excel-2013-qua-giai-de-thi-2', 'topicId': [10, 15]}, {'uri': 'https://gitiho.com/khoa-hoc/tu-ng-bu-o-c-thie-t-la-p-he-tho-ng-gu-i-email-ba-ng-google-sheets', 'topicId': [10, 15]}]
    // const promises = []
    //     for (let link of links) {
    //         const regex = /(udemy.com|unica.vn|kt.city\/course|gitiho.com\/khoa-hoc)/g;
    //         const expression = link.uri.match(regex);
    //         switch (expression[0]) {
    //             case "unica.vn":
    //                 promises.push(cawn_data.unica(link))
    //                 break;
    //             case "udemy.com":
    //                 promises.push(cawn_data.udemy(link))
    //                 break;
    //             case "gitiho.com/khoa-hoc":
    //                 promises.push(cawn_data.gitiho(link))
    //                 break;
    //             default:
    //                 promises.push({ success: false, data: '', messenger: "Lỗi, Không hỗ trợ khoá học này" })
    
    //         }
    //     }
    //     const result = await Promise.all(promises)
    
    //     console.log(result)
    const course = await db.Blog.destroy(
        
        {
        where:{
            categoryId:1
        }
    })
    console.log(course)
}
main()
