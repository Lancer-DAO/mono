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
  paymentId: string;
  bankTransferInfo?: {
    status: string;
    processor: string;
    refundReview: boolean;
    batchedAt: string;
  };
}

export default async function handler(req, res) {
  console.log(req.body);
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  const { paymentId, bankTransferInfo } = req.body as ACHEvent;
  if (!bankTransferInfo) {
    return res.status(200).end();
  }

  try {
    const escrow = await queries.escrow.getFromACHInfo(paymentId);
    await queries.escrow.updateACHState(escrow.id, bankTransferInfo.status);
    console.log("updated ach state");
    return res.json({ success: "Escrow updated" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating ach state." });
  }
}
