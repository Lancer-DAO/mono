import { DB } from "@/db";
import type { NextApiRequest, NextApiResponse } from 'next'


export default async function handler(req: NextApiRequest, res: NextApiResponse)   {
  try {
    await DB.raw("SELECT 1+1 as result");
    res.send("successfully connected to db.");
  } catch (err) {
    console.log(err)
    res.send("error connecting to db.");
  }
}
