import express from 'express';
import dotenv from 'dotenv/config';
import cors from 'cors';
import { auth0, data, health, link } from "./src/routes";
import {auth} from "express-openid-connect";

dotenv;
const app = express();

const port = process.env.PORT;

const config = {
  authRequired: false,
  auth0Logout: true,
  baseURL: 'http://localhost:3000',
  clientID: 'ZSO2kWauQIuunPC5A2T5IMCC2fD5Oerh',
  issuerBaseURL: 'https://dev-kgvm1sxe.us.auth0.com',
  secret: 'LONG_RANDOM_STRING'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));
app.use(cors())
app.use(express.json());

app.use("/data", data);
app.use("/health", health);
app.use("/", auth0);
app.use("/link", link);

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
