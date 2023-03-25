import type { NextApiRequest, NextApiResponse } from 'next'

import { insertAccountIssue, updateAccountIssue } from '@/src/controllers';


export default async function handler(req: NextApiRequest, res: NextApiResponse)  {
    try {
        const data = await req.body;

        switch(req.method) {

            case "POST":
                return res.json(
                  await insertAccountIssue(data)
                );
            case "PUT":
                return res.json(
                  await updateAccountIssue(data)
                );
            default:

                return res.status(401).send({ error: 'method not found' })

        }
      } catch (err) {
        res.status(500).send({ error: 'failed to get account', message: `$${err?.message}` })
      }
  }


