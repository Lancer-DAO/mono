import type { NextApiRequest, NextApiResponse } from 'next'
import axios from "axios";

import { getIssueByUuid, insertAccountIssue, updateAccountIssue, updateIssueState } from '@/src/controllers';
import { Octokit } from 'octokit';


export default async function handler(req: NextApiRequest, res: NextApiResponse)  {
    try {
        const data = await req.body;

        switch(req.method) {

            case "POST":
                const issue = await getIssueByUuid(data.uuid)

  var pull_number = issue.pull_number;
  var org = issue.org;
  var repo = issue.repo;
  var github_id = data.githubId;
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

const octokitResponse = await octokit.request('PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge', {
    owner: org,
    repo: repo,
    pull_number: pull_number
  })
  updateIssueState({
    uuid: data.uuid,
    state: 'complete'
  })
  return res.status(200).json({message: 'Pull Request Merged', data: octokitResponse.data})

            default:

                return res.status(401).send({ error: 'method not found' })

        }
      } catch (err) {
        res.status(500).send({ error: 'failed to get account', message: `$${err?.message}` })
      }
  }


