import { getAccount, getAccountByEmail, insertAccount, insertAccountByEmail } from '@/src/controllers';
import { magic } from '@/src/utils/magic-admin';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse)  {
    try {
    const {session, publicKey, githubId} = req.body;

        const metadata = await magic.users.getMetadataByToken(session);

        const email = metadata.email;


    const accountResponse = await getAccountByEmail(email);
    if(accountResponse.message === "NOT FOUND") {
        await insertAccountByEmail(email)

    return res.json(
        await getAccountByEmail(email)
      );
    } else {
        return res.json(
            accountResponse
        )
    }
    } catch (err) {
        console.error(err)
        res.status(500).send({ error: 'failed to log in', message: `$${err?.message}` })
      }
}