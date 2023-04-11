import { getFullPullRequestByNumber, insertIssue, newPullRequest } from "@/src/controllers";
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse)  {
    try {
      if(req.method === 'POST') {
        const data = await req.body;
        return res.json(
            await insertIssue(data)
          );
      }
    } catch (err) {
        res.status(500).send({ error: 'failed to get pull_request', message: `$${err?.message}` })
      }
  }