import express from "express";
import cors from "cors";
import { data, health } from "./routes";

const app = express();
const port = 8080;

var corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use("/data", data);
app.use("/health", health);
app.use("/", (req, res) => {
  res.send("particles app");
});
app.use((err, req, res, next) => {
  res.status(500).send("Something broke!");
});
app.listen(port, () => {
  console.log(`raffler app listening at http://localhost:${port}`);
});
