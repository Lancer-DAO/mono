import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import * as queries from "@/prisma/queries";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { z } from "zod";
const getFeePayer = () => {
  const secret = process.env.FEE_PAYER_KEY;
  const nums = secret.split(",");
  const secretArray = nums.map((val) => parseInt(val));
  const secretKey = Uint8Array.from(secretArray);
  return Keypair.fromSecretKey(secretKey);
};
export const maybeInitAccount = protectedProcedure
  .input(
    z.object({
      publicKey: z.string(),
    })
  )
  .mutation(async ({ ctx, input: { publicKey } }) => {
    const { id } = ctx.user;
    try {
      const connection = new Connection(
        process.env.NEXT_PUBLIC_IS_MAINNET
          ? "https://winter-necessary-smoke.solana-mainnet.discover.quiknode.pro"
          : "https://api.devnet.solana.com"
      );
      const toPubkey = new PublicKey(publicKey);
      const balance = await connection.getBalance(toPubkey);
      let walletInstance;

      if (balance === 0) {
        const user = await queries.user.getById(id);
        try {
          walletInstance = await queries.wallet.getOrCreate(user, publicKey);

          if (!walletInstance || walletInstance.hasBeenInitialized) {
            return;
          }
        } catch (e) {
          console.error(e);
          return;
        }

        const wallet = getFeePayer();
        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey,
            lamports: 30000000, // 0.01 SOL
          })
        );
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        const txInfo = {
          /** The transaction fee payer */
          feePayer: new PublicKey(wallet.publicKey),
          /** A recent blockhash */
          blockhash: blockhash,
          /** the last block chain can advance to before tx is exportd expired */
          lastValidBlockHeight: lastValidBlockHeight,
        };
        const transaction = new Transaction(txInfo).add(tx);

        await sendAndConfirmTransaction(connection, transaction, [wallet]);

        await queries.wallet.updateHasBeenInitialized(walletInstance);
      }
      // console.log(balance);
    } catch (e) {
      console.error(e);
    }
  });
