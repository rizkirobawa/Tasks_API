const express = require("express");
const app = express();
const port = 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded());
app.set("view engine", "ejs");

const cors = require("cors");
app.use(cors());

const swaggerUI = require("swagger-ui-express");
const yaml = require("yaml");
const fs = require("fs");
const file = fs.readFileSync("./task-docs-api.yaml", "utf-8");
const swaggerDocument = yaml.parse(file);

app.use("/v1/task-api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

const v1Router = require("./routes/v1/index.js");
app.use("/v1", v1Router);

app.listen(port, function () {
  console.log(`app listening on port ${port}`);
});
