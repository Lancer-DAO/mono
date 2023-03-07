import { Router } from "express";
import { PublicKey } from "@solana/web3.js";
import {
  insertAccount,
  getAccount,
} from "../../controllers";
import {
  ACCOUNT_API_ROUTE,
} from "../../constants";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import axios from "axios";
import { Octokit } from "octokit";
dayjs.extend(timezone);

const router = Router();

// USERS

router.post(`/${ACCOUNT_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await insertAccount({ githubLogin: req.query.githubLogin as string,
        githubId: req.query.githubId as string,
        solanaKey: new PublicKey(req.query.solana_key as string) })
    );
  } catch (err) {
    next(err);
  }
});

router.get(`/${ACCOUNT_API_ROUTE}`, async function (req, res, next) {
  try {
    return res.json(
      await getAccount({ githubId: req.query.githubId as string, })
    );
  } catch (err) {
    next(err);
  }
});

router.get(`/${ACCOUNT_API_ROUTE}/organizations`, (req, res) => {
    //when a request from auth0 is received we get auth code as query param
    var github_id = req.query.githubId;
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
        url: `https://dev-kgvm1sxe.us.auth0.com/api/v2/users/${github_id}`,
        headers: {'content-type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${code}`},
      };
      // console.log('options', options)

      axios.request(options).then(function (response) {
        // console.log('axios', response)

      const gh_token = response.data.identities[0].access_token;
      const username = response.data.nickname;
      console.log('token', response.data)
      // console.log(gh_token)
      const octokit = new Octokit({
        auth: gh_token,
      });
      octokit.request('GET /user/repos', {
      }).then((resp) => {

        return res.status(200).json({message: 'Organizations Found', data: resp.data})
      }).catch((error) => {

        console.error(error);

        return res.status(500).send({message: error})
      })
      }).catch(function (error) {
        console.error(error);

        return res.status(500).send({message: error})
      })
    }).catch(function (error) {
      console.error(error);
      return res.status(500).send({message: error})

    });
  });

export default router