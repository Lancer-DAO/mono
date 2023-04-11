import {
  getAccount,
  getAccountByEmail,
  insertAccount,
  insertAccountByEmail,
  updateAccountByEmail,
} from "@/src/controllers";
import { magic } from "@/src/utils/magic-admin";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { session, publicKey, githubId } = req.body;
    const { email } = await magic.users.getMetadataByToken(session);
    const account = await getAccountByEmail(email);

    if (account.message === "NOT FOUND") {
      await insertAccountByEmail(email);
      await updateAccountByEmail(email, publicKey, githubId);

      return res.json(await getAccountByEmail(email));
    } else return res.json(account);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ error: "failed to log in", message: `$${err?.message}` });
  }
}
