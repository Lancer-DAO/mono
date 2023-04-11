import { createGithubIssue, getFullPullRequestByNumber, insertIssue, newAccountIssue, newPullRequest } from "@/src/controllers";
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse)  {
    try {
      if(req.method === 'POST') {
        const requestData = req.body;
    let issueNumber = requestData.issueNumber;
    if(requestData.createNewIssue) {
    const issueCreationResp = await createGithubIssue(
        req.body
    );
        issueNumber = issueCreationResp.data.number;
    }
    return res.json(
        await newAccountIssue({...requestData, issueNumber: issueNumber})
    );
      }
    } catch (err) {
      console.error(err)
        res.status(500).send({ error: 'failed to get pull_request', message: `$${err?.message}` })
      }
  }