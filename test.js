const cawn_data = require("./service/cawn_data")
const db = require('./models')
const main= async () => {
  await cawn_data.udemy('https://www.udemy.com/course/build-a-microservices-app-with-dotnet-and-nextjs-from-scratch/')
}

main()