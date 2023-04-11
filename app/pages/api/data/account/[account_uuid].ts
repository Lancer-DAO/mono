import type { NextApiRequest, NextApiResponse } from 'next'

import { getAccount } from '@/src/controllers';

// USERS

export default async function handler(req: NextApiRequest, res: NextApiResponse)  {
    try {
        return res.json(
            await getAccount({ githubId: req.query.account_uuid as string, })
          );
      } catch (err) {
        res.status(500).send({ error: 'failed to get account', message: `$${err?.message}` })
      }
  }