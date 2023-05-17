import { clusterApiUrl, Connection, PublicKey, Transaction } from "@solana/web3.js";
import { IS_MAINNET } from "@/constants";
import { USDC_MINT, MAINNET_RPC, MAINNET_USDC_MINT } from "../constants/web3";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount } from "@solana/spl-token";
import { LancerWallet } from "@/src/types";

export const shortenPublicKey = (key: PublicKey) => {
  return `${key.toString().slice(0, 4)}...${key.toString().slice(-4)}`;
};

export const getSolscanAddress = (pubkey: PublicKey) => {
  return `https://solscan.io/account/${pubkey.toString()}${IS_MAINNET ? '' : '?cluster=devnet'}`
}

export const getSolscanTX = (hash: string) => {
  return `https://solscan.io/tx/${hash}${IS_MAINNET ? '' : '?cluster=devnet'}`
}

export const getMintName = (mint?: PublicKey) => {
  if(!mint){
    return 'SOL'
  }
  const mintString = mint.toString()
  if(mintString === USDC_MINT || mintString === MAINNET_USDC_MINT) {
    return 'USDC'
  }

  return 'SOL'
}

export const getEndpoint = () => {
  return IS_MAINNET ? MAINNET_RPC: clusterApiUrl("devnet");
}

export const maybeCreateTokenAccount = async (tokenAddress: PublicKey, owner: PublicKey, mint: PublicKey, wallet: LancerWallet, connection: Connection ) => {
  try {

    const creator_company_tokens_account = await getAccount(
      connection,
      tokenAddress
    )
    return creator_company_tokens_account
  } catch (e) {
    const ix = await createAssociatedTokenAccountInstruction(new PublicKey(wallet.publicKey), tokenAddress, owner, mint)
    const {blockhash, lastValidBlockHeight} = (await connection.getLatestBlockhash());
      const txInfo = {
                /** The transaction fee payer */
                feePayer: new PublicKey(wallet.publicKey),
                /** A recent blockhash */
                blockhash: blockhash,
                /** the last block chain can advance to before tx is exportd expired */
                lastValidBlockHeight: lastValidBlockHeight,
              }
      const tx = await wallet.signAndSendTransaction(
        new Transaction(txInfo).add(ix)
      );
  }
}
