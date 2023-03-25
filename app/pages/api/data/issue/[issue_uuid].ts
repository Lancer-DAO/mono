import type { NextApiRequest, NextApiResponse } from 'next'

import {  getIssueById, getIssueByUuid } from '@/src/controllers';

// USERS

export default async function handler(req: NextApiRequest, res: NextApiResponse)  {
    try {
        return res.json(
            await getIssueByUuid( req.query.issue_uuid as string)
          );
      } catch (err) {
        res.status(500).send({ error: 'failed to get issue', message: `$${err?.message}` })
      }
  }


