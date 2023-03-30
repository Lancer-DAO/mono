import { getAccount, getAccountByEmail, insertAccount, insertAccountByEmail, updateAccountByEmail } from '@/src/controllers';
import { magic } from '@/src/utils/magic-admin';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse)  {
    try {
    const {email, publicKey, githubId} = req.body;
    return res.json(await updateAccountByEmail(email, publicKey, githubId))
    } catch (err) {
        console.error(err)
        res.status(500).send({ error: 'failed to log in', message: `$${err?.message}` })
      }
}