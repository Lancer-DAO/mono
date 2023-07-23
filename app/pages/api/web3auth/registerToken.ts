import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { updateSession } from "@auth0/nextjs-auth0";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userInfo = req.body.data;
  updateSession(req, res, {
    user: {
      email: userInfo.email,
      sub: userInfo.verifierId,
      nickname: userInfo.name,
      token: userInfo.oAuthIdToken,
    },
  });

  return { hello: "world" };
}
