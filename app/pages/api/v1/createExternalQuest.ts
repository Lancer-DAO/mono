// pages/api/emails.js
import * as queries from "@/prisma/queries";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  const { createdAt } = req.body;
  const { description } = req.body;
  const { isPrivate } = req.body;
  const { isExternal } = req.body;
  const { title } = req.body;
  const { links } = req.body;
  const { user } = req.body;
  const { price } = req.body;
  /*
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: "ids should be an array." });
  }
  */

  try {
    const bounty = await queries.bounty.createExternal(
        createdAt,
        description,
        isPrivate,
        isExternal,
        title,
        links,
        user,
        price
    );

    return res.json({ bounty });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating external bounties." });
  }
}
