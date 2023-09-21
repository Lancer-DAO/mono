import base58 from 'bs58';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Connection, Keypair, sendAndConfirmRawTransaction, Transaction } from "@solana/web3.js";
import { core } from '@solana/octane-core';

type Data = { status: 'ok', txid: string } | { status: 'error', message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {


  const connection = new Connection(process.env.NEXT_PUBLIC_IS_MAINNET
    ? "https://winter-necessary-smoke.solana-mainnet.discover.quiknode.pro"
    : "https://solana-devnet.g.alchemy.com/v2/uUAHkqkfrVERwRHXnj8PEixT8792zETN"
  );

  const serialized = req.body?.transaction;
  if (typeof serialized !== 'string') {
    res.status(400).send({ status: 'error', message: 'Request should contain transaction' });
    return;
  }

  const feePayer = Keypair.fromSecretKey(base58.decode(process.env.NEXT_PUBLIC_GASLESS_KEY));
  let transaction: Transaction;
  try {
    transaction = Transaction.from(base58.decode(serialized));
  } catch (e) {
    console.log("\n", e)
    res.status(400).send({ status: 'error', message: "Can't decode transaction" });
    return;
  }
  console.log("Account and properties (address-signer-writable")
  for (const instruction of transaction.instructions) {
    for (const key of instruction.keys) {
      console.log(key.pubkey.toBase58(), key.isSigner, key.isWritable)
    }
  }
  let signature: string;
  try {
    signature = (await core.validateTransaction(
      connection,
      transaction,
      feePayer,
      2,
      5000,
    )).signature;
  } catch (e) {
    console.log("\n", e)
    res.status(400).send({ status: 'error', message: 'Bad transaction' });
    return;
  }

  // 
  // try {
  //   await core.validateInstructions(transaction, feePayer);
  // } catch (e) {
  //   console.log("\n", e)
  //   res.status(400).send({ status: 'error', message: 'Bad instructions' });
  //   return;
  // }


  try {
    await connection.simulateTransaction(transaction);
  } catch (e) {
    console.log("Error, simulation failed: ", e)
    res.status(400).send({ status: 'error', message: 'Simulation failed' });
    return;
  }

  transaction.addSignature(
    feePayer.publicKey,
    Buffer.from(base58.decode(signature))
  );


  const txid = await connection.sendRawTransaction(
    transaction.serialize()
    );

  res.status(200).json({ status: 'ok', txid });
}