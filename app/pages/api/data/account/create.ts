import type { NextApiRequest, NextApiResponse } from 'next'

import { getGitHubUser, insertAccount } from '@/src/controllers';

// USERS

export default async function handler(req: NextApiRequest, res: NextApiResponse)  {
    try {
        const body = await req.body;
        const githubId= body.githubId as string;
        const solanaKey = body.solanaKey as string;
        const githubData = await getGitHubUser(githubId);
        const insertData = {
          githubId: githubId,
          solanaKey: solanaKey,
          githubLogin: githubData.data.nickname,
        }
        return res.send(
          await insertAccount(insertData)
        );
      } catch (err) {
        res.status(500).send({ error: 'failed to create account', message: `$${err?.message}` })
      }
  }


