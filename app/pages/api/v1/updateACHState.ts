// pages/api/emails.js
import * as queries from "@/prisma/queries";

interface ACHEvent {
  eventType: string;
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
    data: { id: paymentId },
  } = req.body as ACHEvent;
  if (!eventType.includes("ACH")) {
    return res.status(200).end();
  }

  try {
    const escrow = await queries.escrow.getFromACHInfo(paymentId);
    await queries.escrow.updateACHState(escrow.id, eventType);
    return res.json({ success: "Escrow updated" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating ach state." });
  }
}
