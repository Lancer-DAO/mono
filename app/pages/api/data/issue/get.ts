import { createGithubIssue, getFullPullRequestByNumber, getIssueByNumber, getIssueByUuid, insertIssue, newAccountIssue, newPullRequest } from "@/src/controllers";
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse)  {
    try {
      if(req.method === 'POST') {
        const requestData = req.body;
        if(requestData.id) {
            return res.json(
              await getIssueByUuid(requestData.id as string)
            );
          }
          else {
            return res.json(
              await getIssueByNumber(requestData)
            );
          }
      }
    } catch (err) {
        res.status(500).send({ error: 'failed to get pull_request', message: `$${err?.message}` })
      }
  }