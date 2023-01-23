import { Router } from "express";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(timezone);
import request from "request";
import axios from "axios";
import { Octokit } from 'octokit';
import jwt_decode from "jwt-decode";
const router = Router();

// USERS

router.get("/callback", (req, res) => {
    //when a request from auth0 is received we get auth code as query param
    console.log('calling back')
    const authCode = req.query.code;
    var options = {
      method: "POST",
      url: process.env.AUTH_URL || '',
      headers: { "content-type": "application/x-www-form-urlencoded" },
      form: {
        grant_type: "authorization_code", //need to send authcode to grant our access to auth0
        client_id: process.env.CLIENT_ID, //auth0 clientID
        client_secret: process.env.CLIENT_SECRET, //auth0 client secret
        code: authCode, //we will be sending this code to get the id_token from auth0
        redirect_uri: process.env.REDIRECT_URI, //url mentioned in auth0 client
        scope: "openid profile email",
      },
    };

    //to get id_token we need to send post req to auth0
    request(options, function (error, response, data) {
      if (error) throw new Error(error);
      console.log(data)
      const id_token = JSON.parse(data)["id_token"];
      var decoded = jwt_decode(id_token);
      console.log('jwt', decoded)
      const redirect_url = process.env.EXTENSION_ENDPOINT + id_token;
      res.redirect(redirect_url);
    });
  });

  router.get("/ghToken", (req, res) => {
    //when a request from auth0 is received we get auth code as query param

    var pull_number = parseInt(req.query.pull_number as string);
    var org = req.query.org as string;
    var repo = req.query.repo as string;
    var user_id = req.query.user_id;
    console.log('ghtoken')
    var options = {
      method: 'POST',
      url: 'https://dev-kgvm1sxe.us.auth0.com/oauth/token',
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      data: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.CLIENT_ID || '', //auth0 clientID
        client_secret: process.env.CLIENT_SECRET || '', //auth0 client secret
        audience: `${process.env.BASE_URL}api/v2/`
      })
    };
    axios.request(options).then(function (response) {
      var code = response.data.access_token
      var options = {
        method: 'GET',
        url: `https://dev-kgvm1sxe.us.auth0.com/api/v2/users/${user_id}`,
        headers: {'content-type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${code}`},
      };

      axios.request(options).then(function (response) {

      const gh_token = response.data.identities[0].access_token;
      console.log(gh_token)
      const octokit = new Octokit({
        auth: gh_token,
      });
      octokit.request('PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge', {
        owner: org,
        repo: repo,
        pull_number: pull_number
      }).then((resp) => {
        console.log(resp)

        return res.status(200).json({message: 'token acquired', data: response.data})
      }).catch((error) => {

        console.error(error);

        return res.status(error.status).send({message: error})
      })
      }).catch(function (error) {
        console.error(error);

        return res.status(error.status).send({message: error})
      })
    }).catch(function (error) {
      console.error(error);
      return res.status(error.status).send({message: error})

    });
  });

export default router;
