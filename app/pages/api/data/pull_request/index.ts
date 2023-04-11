import { getFullPullRequestByNumber, newPullRequest } from "@/src/controllers";
import type { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}
export default async function handler(req: NextApiRequest, res: NextApiResponse)  {
  await runMiddleware(req, res, cors)
    try {
      if(req.method === 'POST') {
        const data = await req.body;
        return res.json(
            await getFullPullRequestByNumber(data)
          );
      }
      return res.status(400).send({ error: 'method not found'})

    } catch (err) {
        res.status(500).send({ error: 'failed to get pull_request', message: `$${err?.message}` })
      }
  }