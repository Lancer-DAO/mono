import { createGithubIssue, getAccountsForIssue, getFullPullRequestByNumber, insertIssue, newAccountIssue, newPullRequest } from "@/src/controllers";
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse)  {
    try {
      if(req.method === 'POST') {
        const requestData = req.body;
        return res.json(
            await getAccountsForIssue(requestData.uuid)
          );
        }
    } catch (err) {
        res.status(500).send({ error: 'failed to get pull_request', message: `$${err?.message}` })
      }
  }