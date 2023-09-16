// pages/api/emails.js
import * as queries from "@/prisma/queries";

interface ACHEvent {
  eventType: string;
  created: string; // UTC ISO string
  data: {
    id: string;
    wallet: string;
    webhookInfo: object | undefined | null;
    subtotal: { cents: number };
    fees: { cents: number };
    gasFees: { cents: number };
    total: { cents: number };
  };
}

export default async function handler(req, res) {
  console.log(req.body);
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  const {
    eventType,
    data: { subtotal, wallet },
  } = req.body as ACHEvent;

  try {
    const escrows = await queries.escrow.getFromACHInfo(
      (subtotal.cents / 100.0).toFixed(2),
      wallet
    );
    console.log("escrows", escrows);
    const escrow = {
      id: escrows[0].escrowid,
    };
    await queries.escrow.updateACHState(escrow.id, eventType);
    console.log("updated ach state");
    return res.json({ success: "Escrow updated" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating ach state." });
  }
}
