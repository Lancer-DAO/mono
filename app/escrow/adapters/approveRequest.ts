import {
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { AnchorProvider, Program, } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { approveRequestInstruction } from "@/escrow/sdk/instructions";
import { DEVNET_USDC_MINT } from "@/src/constants";
import { Escrow, EscrowContract, LancerWallet } from "@/src/types";
import { findLancerCompanyTokens, findLancerCompleterTokens } from "@/escrow/sdk/pda";
import { maybeCreateTokenAccount } from "@/src/utils";


export const approveRequestFFA = async (submitter: PublicKey, acc: Escrow, wallet: LancerWallet, program: Program<MonoProgram>, provider: AnchorProvider) => {

  const creator = new PublicKey(wallet.publicKey)
      const tokenAddress = await getAssociatedTokenAddress(
        new PublicKey(DEVNET_USDC_MINT),
        submitter
      );

    const [lancer_completer_tokens] = await findLancerCompleterTokens(program);
    const [lancer_company_tokens] = await findLancerCompanyTokens(program);
    const creator_company_tokens_account = await getAssociatedTokenAddress(
      lancer_company_tokens,
      new PublicKey(wallet.publicKey)
    )

    const payout_completer_tokens_account = await getAssociatedTokenAddress(
      lancer_completer_tokens,
      submitter
    )
    await maybeCreateTokenAccount(creator_company_tokens_account, creator, lancer_company_tokens, wallet,provider.connection)
    await maybeCreateTokenAccount(lancer_completer_tokens, submitter, lancer_completer_tokens, wallet,provider.connection)
      let approveSubmitterIx = await approveRequestInstruction(
        acc.timestamp,
        payout_completer_tokens_account,
        creator_company_tokens_account,
        new PublicKey(wallet.publicKey),
        submitter,
        tokenAddress,
        new PublicKey(DEVNET_USDC_MINT),
        program
      )

      const {blockhash, lastValidBlockHeight} = (await provider.connection.getLatestBlockhash());
      const txInfo = {
                /** The transaction fee payer */
                feePayer: new PublicKey(wallet.publicKey),
                /** A recent blockhash */
                blockhash: blockhash,
                /** the last block chain can advance to before tx is exportd expired */
                lastValidBlockHeight: lastValidBlockHeight,
              }
      const tx = await wallet.signAndSendTransaction(
        new Transaction(txInfo).add(approveSubmitterIx)
      );
      return tx;

  };