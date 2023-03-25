import { getFullPullRequestByNumber, newPullRequest, updateIssue } from "@/src/controllers";
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse)  {
    try {
      if(req.method === 'PUT') {
        const data = await req.body;
        return res.json(
            await updateIssue(data)
          );
      }
      res.status(400).send({ error: 'method not found' })

    } catch (err) {
        res.status(500).send({ error: 'failed to get pull_request', message: `$${err?.message}` })
      }
  }