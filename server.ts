import express, { Express, Request, Response } from "express";
import { createServer } from "http";
import { Collection, MongoClient, ObjectId } from "mongodb";
import next from "next";

const cors = require("cors");
const dev = process.env.NODE_ENV !== "production";
console.log("BEFORE START APP");

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare({}).then(() => {
  console.log("AFTER START APP");
  createServer(handle).listen(3000, () => {
    console.log(`> Ready on http://localhost:${3000}`);
  });

  const server = express();
  const port = 8000;
  const mongoClient = new MongoClient(
    "mongodb://mongo:uzCWBEUSaXntcrbmbZBriLukxlCBuzjr@autorack.proxy.rlwy.net:12119/"
  );
  server.use(express.json());
  server.use(cors());

  (async () => {
    console.log("express app");

    try {
      await mongoClient.connect();
      server.locals.collection = mongoClient
        .db("vacancies_app")
        .collection("vacancies");
      server.listen(port);
      console.log(`Приложение запущено, port: ${port}`);
    } catch (err) {
      return console.log(err);
    }
  })();

  server.get("/api/vacancies", async (req, res) => {
    const collection = req.app.locals.collection as Collection<Document>;
    console.log("GET ");
    const vacancies = await collection.find({}).toArray();
    console.log(vacancies);

    res.json(vacancies);
  });

  server.post("/api/vacancies", (req, res) => {
    const collection = req.app.locals.collection as Collection<Document>;
    const insert_data = req.body;
    console.log("post:", insert_data);
    switch (insert_data.status) {
      case "waiting":
        insert_data.status = "Ожидание";
        break;
      case "Decline":
        insert_data.status = "Отказ";
        break;
      case "Accept":
        insert_data.status = "Приглашение";
        break;
    }
    collection.insertOne(insert_data);
    res.json(collection.find({}).toArray());
  });

  server.patch("/api/vacancies", (req, res) => {
    const collection = req.app.locals.collection as Collection<Document>;
    const { _id, ...insert_data } = req.body;
    console.log("patch:", insert_data);
    switch (insert_data.status) {
      case "waiting":
        insert_data.status = "Ожидание";
        break;
      case "Decline":
        insert_data.status = "Отказ";
        break;
      case "Accept":
        insert_data.status = "Приглашение";
        break;
    }
    collection.updateOne({ _id: new ObjectId(_id) }, { $set: insert_data });
    res.json(collection.find({}).toArray());
  });

  server.delete("/api/vacancies", (req, res) => {
    const collection = req.app.locals.collection as Collection<Document>;
    const { _id } = req.body;
    console.log("delete:", _id);

    collection.deleteOne({ _id: new ObjectId(_id) });
    res.json(collection.find({}).toArray());
  });

  process.on("SIGINT", async () => {
    await mongoClient.close();
    console.log("Приложение завершило работу");
    process.exit();
  });
});
