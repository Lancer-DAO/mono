// pages/api/emails.js
import * as queries from "@/prisma/queries";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    const quests = await queries.bounty.getExternal();

    return res.json({ quests });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching external quests." });
  }
}
