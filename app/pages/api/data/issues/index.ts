import { createGithubIssue, getAccountsForIssue, getAllIssues, getAllIssuesForUser, getFullPullRequestByNumber, insertIssue, newAccountIssue, newPullRequest } from "@/src/controllers";
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse)  {
    try {
      if(req.method === 'POST') {
        const requestData = req.body;
        return res.json(await getAllIssuesForUser(requestData.uuid as string))

        } else if (req.method === 'GET') {
      return res.json(await getAllIssues())

        }
    } catch (err) {
      console.error(err)
        res.status(500).send({ error: 'failed to get pull_request', message: `$${err?.message}` })
      }
  }