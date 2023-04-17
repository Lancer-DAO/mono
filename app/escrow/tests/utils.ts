import * as anchor from "@project-serum/anchor";
import { createSyncNativeInstruction } from "@solana/spl-token";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

export const createKeypair = async (
  provider: anchor.AnchorProvider
) => {
    const keypair = new anchor.web3.Keypair();
    const latestBlockHash = await provider.connection.getLatestBlockhash();
    
    const airdropSignature = await provider.connection.requestAirdrop(
      keypair.publicKey,
      10 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: airdropSignature,    
    });
    return keypair;
};

export const add_more_token = async (
  provider:  anchor.AnchorProvider,
  token_account: PublicKey,
  WSOL_AMOUNT : number,
) => {

    let convert_to_wsol_tx = new Transaction().add(
      // trasnfer SOL
      SystemProgram.transfer({
        fromPubkey: provider.publicKey,
        toPubkey: token_account,
        lamports: WSOL_AMOUNT,
      }),
      // sync wrapped SOL balance
      createSyncNativeInstruction(token_account)
    );  
    await provider.sendAndConfirm(convert_to_wsol_tx, [] );

}