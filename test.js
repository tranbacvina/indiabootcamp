const cawn_data = require("./service/cawn_data")

const main= async () => {
  await cawn_data.cawnUnica('https://unica.vn/ung-dung-power-bi-trong-viec-phan-tich-va-tao-lap-bao-cao-quan-tri?fbclid=IwAR2QuFoKZdp-VN-LfSc5cehorWDQ-b7p96vejIbMChuHf3UdQfplu87CX2g')
}

main()