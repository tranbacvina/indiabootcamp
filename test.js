const cawn_data = require("./service/cawn_data_test")

const main = async() => {
    const links =[{'uri': 'https://unica.vn/excel-ung-dung-trong-phan-tich-tai-chinh', 'topicId': [10]}, {'uri': 'https://unica.vn/lam-chu-bo-cong-cu-van-phong-google-workspace-cho-cong-viec-va-hoc-tap', 'topicId': [10]}, {'uri': 'https://unica.vn/excel-essentials-for-business', 'topicId': [10]}, {'uri': 'https://unica.vn/vba-excel-toan-tap-tu-co-ban-den-nang-cao', 'topicId': [10]}, {'uri': 'https://unica.vn/excel-thuc-chien-nang-cao', 'topicId': [10]}, {'uri': 'https://unica.vn/python-excel-cho-nguoi-di-lam', 'topicId': [10]}, {'uri': 'https://unica.vn/chinh-phuc-chung-chi-mos-excel-2016', 'topicId': [10]}, {'uri': 'https://unica.vn/mos-word-2016-danh-bay-noi-lo-chung-chi', 'topicId': [10]}, {'uri': 'https://unica.vn/hoc-word-ung-dung-hieu-suat-nhan-ba-chuyen-gia-noi-cong-so', 'topicId': [10]}, {'uri': 'https://unica.vn/tro-thanh-sieu-sao-excel-noi-cong-so', 'topicId': [10]}, {'uri': 'https://unica.vn/chinh-phuc-chung-chi-mos-powerpoint-2016', 'topicId': [10]}, {'uri': 'https://unica.vn/vba-tuyet-chieu-nang-cao-hieu-qua-su-dung-excel-va-pha-vo-gioi-han-ban-than', 'topicId': [10]}, {'uri': 'https://unica.vn/power-query-co-ban-xu-ly-du-lieu-chuyen-sau', 'topicId': [10]}, {'uri': 'https://unica.vn/lam-chu-ky-nang-thiet-ke-slide-nhanh-chong-hieu-qua', 'topicId': [10]}, {'uri': 'https://unica.vn/chinh-phuc-chung-chi-ic3-san-sang-vuon-xa', 'topicId': [10]}, {'uri': 'https://unica.vn/tuyet-chieu-thu-thuat-meo-thong-thao-microsoft-excel', 'topicId': [10]}]
    const promises = []
        for (let link of links) {
            const regex = /(udemy.com|unica.vn|kt.city\/course|gitiho.com\/khoa-hoc)/g;
            const expression = link.uri.match(regex);
            switch (expression[0]) {
                case "unica.vn":
                    promises.push(cawn_data.unica(link))
                    break;
                case "udemy.com":
                    promises.push(cawn_data.udemy(link))
                    break;
                case "gitiho.com/khoa-hoc":
                    promises.push(cawn_data.gitiho(link))
                    break;
                default:
                    promises.push({ success: false, data: '', messenger: "Lỗi, Không hỗ trợ khoá học này" })
    
            }
        }
        const result = await Promise.all(promises)
    
        console.log(result)
}
main()
