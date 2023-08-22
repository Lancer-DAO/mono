import { NextApiRequest, NextApiResponse } from "next";
import { updateSession, getSession } from "@auth0/nextjs-auth0";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userInfo = req.body.data;
  const session = await getSession(req, res);

  console.log(userInfo);
  if (
    !session?.user?.email &&
    userInfo.email &&
    userInfo.verifierId &&
    userInfo.name &&
    userInfo.oAuthIdToken
  ) {
    updateSession(req, res, {
      user: {
        email: userInfo.email,
        sub: userInfo.verifierId,
        nickname: userInfo.name,
        token: userInfo.oAuthIdToken,
      },
    });
  }

  return { hello: "world" };
}
