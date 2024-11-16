const express = require('express')
const app = express()
const port = 8000
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectId

const mongoClient = new MongoClient("mongodb://127.0.0.1:27017/");
(async () => {
  try {
     await mongoClient.connect();
     app.locals.collection = mongoClient.db("vacancies_app").collection("vacancies");
     app.listen(port);
 }catch(err) {
     return console.log(err);
 } 
})();


app.get('/', (req, res) => {
  const collection = req.app.locals.collection;

  res.send('Hello World!')
})

process.on("SIGINT", async() => {
      
  await mongoClient.close();
  console.log("Приложение завершило работу");
  process.exit();
});