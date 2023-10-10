import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

export const sendGaslessTx = async (
  instructions: TransactionInstruction[],
  sign?: boolean,
  wallet?
) => {
  const tx = new Transaction();

  const { blockhash } = await new Connection(
    process.env.NEXT_PUBLIC_IS_MAINNET === "true"
      ? "https://winter-necessary-smoke.solana-mainnet.discover.quiknode.pro"
      : "https://solana-devnet.g.alchemy.com/v2/uUAHkqkfrVERwRHXnj8PEixT8792zETN"
  ).getLatestBlockhash();

  instructions.forEach((ix) => tx.add(ix));

  tx.recentBlockhash = blockhash;
  tx.feePayer = new PublicKey("pyrSoEahjKGKZpLWEYwCJ8zQAsYZckZH8ZqJ7yGd1ha");

  // Signature only required for authorized user actions
  let signed;
  if (sign) {
    signed = await wallet.signTransaction(tx);
  }

  const serialized = sign
    ? signed.serialize({ requireAllSignatures: false })
    : tx.serialize({ requireAllSignatures: false });

  const res = await fetch(`/api/gasless`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transaction: bs58.encode(serialized) }),
  });

  const json = await res.json();
  return {
    signature: json.txid,
    status: json.status,
    message: json.message,
  };
};
