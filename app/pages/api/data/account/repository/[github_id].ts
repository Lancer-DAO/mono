import type { NextApiRequest, NextApiResponse } from 'next'
import axios from "axios";

import { Octokit } from 'octokit';

// USERS

export default async function handler(req: NextApiRequest, res: NextApiResponse)  {
    try {
      // first, get the auth0 token

      // const github_id = req.query.github_id;
      // const auth0TokenResponse = await axios.request({
      //     method: 'POST',
      //     url: 'https://dev-kgvm1sxe.us.auth0.com/oauth/token',
      //     headers: {'content-type': 'application/x-www-form-urlencoded'},
      //     data: new URLSearchParams({
      //       grant_type: 'client_credentials',
      //       client_id: process.env.CLIENT_ID || '', //auth0 clientID
      //       client_secret: process.env.CLIENT_SECRET || '', //auth0 client secret
      //       audience: `${process.env.BASE_URL}api/v2/`
      //     })
      //   })
      // const auth0Token = auth0TokenResponse.data.access_token;
      const {authToken, githubId} = await req.body;
      console.log(authToken, githubId)

      // const githubTokenResponse = await axios.request({
      //   method: 'GET',
      //   url: `https://dev-kgvm1sxe.us.auth0.com/api/v2/users/${githubId}`,
      //   headers: {'content-type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${authToken}`},
      // })

      const octokit = new Octokit({
        auth: authToken,
      });

      const octokitResponse = await octokit.request('GET /user/repos', {
      })
      return res.status(200).json({message: 'Organizations Found', data: octokitResponse.data})

      } catch (err) {
        console.error(err)
        res.status(500).send({ error: 'failed to get account', message: `$${err?.message}` })
      }


  }


