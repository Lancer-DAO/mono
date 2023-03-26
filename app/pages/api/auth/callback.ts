import type { NextApiRequest, NextApiResponse } from 'next'

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(timezone);
import request from "request";
import jwt_decode from "jwt-decode";
const PREFIXES = ["localhost:3000", "vercel.app", "lancer.so"]

// USERS

export default function handler(req: NextApiRequest, res: NextApiResponse)  {
  try {
//when a request from auth0 is received we get auth code as query param
const authCode = req.query.code;
const referrer = req.query.referrer as string;
const prefix = PREFIXES.find((prefix) => referrer.includes(prefix))
const prefix_index = referrer.indexOf(prefix)
const substr = referrer.substring(prefix_index + prefix.length + 1); // get the substring after the comma
  const arr = referrer.split(substr);
let redirect_uri = arr[0];
console.log(redirect_uri, authCode, referrer)
var options = {
  method: "POST",
  url: process.env.AUTH_URL || '',
  headers: { "content-type": "application/x-www-form-urlencoded" },
  form: {
    grant_type: "authorization_code", //need to send authcode to grant our access to auth0
    client_id: process.env.CLIENT_ID, //auth0 clientID
    client_secret: process.env.CLIENT_SECRET, //auth0 client secret
    code: authCode, //we will be sending this code to get the id_token from auth0
    redirect_uri: redirect_uri, //url mentioned in auth0 client
    scope: "openid profile email",
  },
};
console.log(options)

//to get id_token we need to send post req to auth0
return request(options, function (error, response, data) {
  if (error) throw new Error(error);
  const id_token = JSON.parse(data)["id_token"];
  var decoded = jwt_decode(id_token);
  console.log(decoded)
  const redirect_url = referrer + `${referrer.includes('?') ? '&' : '?'}token=` + id_token;
  console.log(redirect_url)
  res.redirect(redirect_url);
});
  } catch (err) {
    console.log(err)
    return res.status(500)
  }

  }


