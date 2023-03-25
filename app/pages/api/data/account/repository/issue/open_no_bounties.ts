import type { NextApiRequest, NextApiResponse } from 'next'
import axios from "axios";

import { Octokit } from 'octokit';
import { getAllIssuesForRepo } from '@/src/controllers';

// USERS

export default async function handler(req: NextApiRequest, res: NextApiResponse)  {
    try {
      if(req.method === 'POST') {
        const {github_id, repo, org} = await req.body;
      // first, get the auth0 token

      const auth0TokenResponse = await axios.request({
          method: 'POST',
          url: 'https://dev-kgvm1sxe.us.auth0.com/oauth/token',
          headers: {'content-type': 'application/x-www-form-urlencoded'},
          data: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: process.env.CLIENT_ID || '', //auth0 clientID
            client_secret: process.env.CLIENT_SECRET || '', //auth0 client secret
            audience: `${process.env.BASE_URL}api/v2/`
          })
        })
      const auth0Token = auth0TokenResponse.data.access_token;

      const githubTokenResponse = await axios.request({
        method: 'GET',
        url: `https://dev-kgvm1sxe.us.auth0.com/api/v2/users/${github_id}`,
        headers: {'content-type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${auth0Token}`},
      })

      const octokit = new Octokit({
        auth: githubTokenResponse.data.identities[0].access_token,
      });

      const octokitResponse = await octokit.request('GET /repos/{owner}/{repo}/issues', {
        owner: org,
        repo: repo
      })

      const rawIssues = await getAllIssuesForRepo(org, repo)
        const issues = rawIssues.message ? [] : rawIssues.map((issue: { issue_number: string; }) => parseInt(issue.issue_number))
        const remainingIssues = octokitResponse.data.filter((issue) => !issues.includes(issue.number))
        return res.status(200).json({message: 'Issues Found', data: remainingIssues})
      }
    } catch (err) {
      console.error(err)
        res.status(500).send({ error: 'failed to get account', message: `$${err?.message}` })
      }


  }


