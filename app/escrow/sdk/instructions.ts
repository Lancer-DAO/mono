import * as anchor from "@project-serum/anchor";
import { AnchorError, IdlTypes, Program } from "@project-serum/anchor";
import { MonoProgram } from "./types/mono_program";

import {
    createAssociatedTokenAccountInstruction,
    getAccount,
    createMint,
    mintToChecked,
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID,
    NATIVE_MINT,
    createSyncNativeInstruction,
    ASSOCIATED_TOKEN_PROGRAM_ID
  } from "@solana/spl-token";
  
  import {
    ComputeBudgetProgram,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    sendAndConfirmTransaction,
    Struct,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    Transaction,
    TransactionInstruction,
  } from '@solana/web3.js';
import { findFeatureAccount, findFeatureTokenAccount, findLancerCompanyTokens, findLancerCompleterTokens, findLancerProgramAuthority, findLancerTokenAccount, findProgramAuthority, findProgramMintAuthority } from "./pda";
import { LANCER_ADMIN } from "./constants";
  

export const createFeatureFundingAccountInstruction = async(
  mint: PublicKey,
  creator: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> => {
  const timestamp = Date.now().toString();
  console.log("timestamp = ", timestamp);
  const [feature_account] = await findFeatureAccount(
      timestamp, 
      creator, 
      program
  );
  const [feature_token_account] = await findFeatureTokenAccount(
      timestamp, 
      creator,
      mint, 
      program,
  );
  
  const [program_authority] = await findProgramAuthority(
      program,
  );

  return await program.methods.createFeatureFundingAccount(timestamp).
      accounts({
          creator: creator,
          fundsMint: mint,
          featureDataAccount: feature_account,
          featureTokenAccount: feature_token_account,
          programAuthority: program_authority,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
          associatedProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
      })
      .instruction();

}

export const fundFeatureInstruction = async (
  amount: number,
  timestamp: string,
  creator: PublicKey,
  mint: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> => {
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );
  const [feature_token_account] = await findFeatureTokenAccount(
    timestamp,
    creator,
    mint,
    program
  );

  const [program_authority] = await findProgramAuthority(program);

  const creator_token_account = await getAssociatedTokenAddress(mint, creator);

  return await program.methods.fundFeature(new anchor.BN(amount))
    .accounts({
      creator: creator,
      creatorTokenAccount: creator_token_account,
      fundsMint: mint,
      featureDataAccount: feature_data_account,
      featureTokenAccount: feature_token_account,
      programAuthority: program_authority,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    }).instruction()
}

export const addApprovedSubmittersInstruction = async (
  timestamp: string,
  creator: PublicKey,
  submitter: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> =>  {
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );

  return  await program.methods.addApprovedSubmitters()
          .accounts({
            creator: creator,
            submitter: submitter,
            featureDataAccount: feature_data_account
          }).instruction()
}

export const removeApprovedSubmittersInstruction = async (
  timestamp: string,
  creator: PublicKey,
  submitter: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> =>  {
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );

  return await program.methods.removeApprovedSubmitters()
          .accounts({
            creator: creator,
            submitter: submitter,
            featureDataAccount: feature_data_account
          }).instruction()
}


export const submitRequestInstruction = async (
  timestamp: string,
  creator: PublicKey,
  submitter: PublicKey,
  submitter_token_account: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> =>  {
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );

  return await program.methods.submitRequest()
  .accounts({
    creator: creator,
    submitter: submitter,
    payoutAccount: submitter_token_account,
    featureDataAccount: feature_data_account,
  }).instruction()

}

export const denyRequestInstruction = async (
  timestamp: string,
  creator: PublicKey,
  submitter: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> =>  {

  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );

  return await program.methods.denyRequest()
  .accounts({
    creator: creator,
    submitter: submitter,
    featureDataAccount: feature_data_account,
  }).instruction();
}

export const approveRequestInstruction = async (
  timestamp: string,
  // payout_completer_tokens_account: PublicKey,
  // creator_company_tokens_account: PublicKey,
  creator: PublicKey,
  submitter: PublicKey,
  submitter_token_account: PublicKey,
  mint: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> =>  {

  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );

  const [feature_token_account] = await findFeatureTokenAccount(
    timestamp, 
    creator,
    mint, 
    program,
  );

  const [program_authority] = await findProgramAuthority(
      program,
  );

  const [lancer_dao_token_account] = await findLancerTokenAccount(
    mint,
    program
  );

  const [lancer_token_program_authority] = await findLancerProgramAuthority(program);

  // const [lancer_completer_tokens] = await findLancerCompleterTokens(program);
  // const [lancer_company_tokens] = await findLancerCompanyTokens(program);
  // const [program_mint_authority, mint_bump] = await findProgramMintAuthority(program);

  return await program.methods.approveRequest((1))// TODO remove this
  .accounts({
    creator: creator,
    submitter: submitter,
    // lancerCompleterTokens: lancer_completer_tokens,
    // lancerCompanyTokens: lancer_company_tokens,
    payoutAccount: submitter_token_account,
    featureDataAccount: feature_data_account,
    // creatorCompanyTokensAccount: creator_company_tokens_account,
    // payoutCompleterTokensAccount: payout_completer_tokens_account,
    featureTokenAccount: feature_token_account,
    programAuthority: program_authority,
    // programMintAuthority: program_mint_authority,
    lancerDaoTokenAccount: lancer_dao_token_account,
    lancerTokenProgramAuthority: lancer_token_program_authority,
    tokenProgram: TOKEN_PROGRAM_ID,
  }).instruction();
}

export const approveRequestThirdPartyInstruction = async (
  timestamp: string,
  third_party_token_account: PublicKey,
  // payout_completer_tokens_account: PublicKey,
  // creator_company_tokens_account: PublicKey,
  creator: PublicKey,
  submitter: PublicKey,
  submitter_token_account: PublicKey,
  mint: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> =>  {

  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );

  const [feature_token_account] = await findFeatureTokenAccount(
    timestamp, 
    creator,
    mint, 
    program,
  );

  const [program_authority] = await findProgramAuthority(
      program,
  );

  const [lancer_dao_token_account] = await findLancerTokenAccount(
    mint,
    program
  );

  // const [lancer_token_program_authority] = await findLancerProgramAuthority(program);

  // const [lancer_completer_tokens] = await findLancerCompleterTokens(program);
  // const [lancer_company_tokens] = await findLancerCompanyTokens(program);
  // const [program_mint_authority, mint_bump] = await findProgramMintAuthority(program);

  return await program.methods.approveRequestThirdParty((1))
  .accounts({
    creator: creator,
    submitter: submitter,
    // lancerCompleterTokens: lancer_completer_tokens,
    // lancerCompanyTokens: lancer_company_tokens,
    payoutAccount: submitter_token_account,
    featureDataAccount: feature_data_account,
    // creatorCompanyTokensAccount: creator_company_tokens_account,
    // payoutCompleterTokensAccount: payout_completer_tokens_account,
    featureTokenAccount: feature_token_account,
    programAuthority: program_authority,
    // programMintAuthority: program_mint_authority,
    thirdParty: third_party_token_account,
    lancerDaoTokenAccount: lancer_dao_token_account,
    // lancerTokenProgramAuthority: lancer_token_program_authority,
    tokenProgram: TOKEN_PROGRAM_ID,
  }).instruction();
}


export const createLancerTokenAccountInstruction =async (
  funds_mint: PublicKey,
  program: Program<MonoProgram>,
) => {

  const [lancer_token_program_authority] = await findLancerProgramAuthority(
    program
  );

  const [lancer_dao_token_account] = await findLancerTokenAccount(
    funds_mint,
    program
  );


  return await program.methods.createLancerTokenAccount()
    .accounts({
      lancerAdmin: LANCER_ADMIN,
      fundsMint: funds_mint,
      lancerDaoTokenAccount: lancer_dao_token_account,
      programAuthority: lancer_token_program_authority,
    }).instruction()
}

export const voteToCancelInstruction = async (
  timestamp: string,
  creator: PublicKey,
  voter: PublicKey,
  isCancel: boolean,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> =>  {

  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );

  return await program.methods.voteToCancel(isCancel)
  .accounts({
    creator: creator,
    voter: voter,
    featureDataAccount: feature_data_account
  }).instruction();
}

export const cancelFeatureInstruction = async (
  timestamp: string,
  creator: PublicKey,
  creator_token_account: PublicKey,
  mint: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> =>  {

  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );
  const [feature_token_account] = await findFeatureTokenAccount(
    timestamp, 
    creator,
    mint, 
    program,
  );

const [program_authority] = await findProgramAuthority(
    program,
);

  return await program.methods.cancelFeature()
  .accounts({
    creator: creator,
    creatorTokenAccount: creator_token_account,
    featureDataAccount: feature_data_account,
    featureTokenAccount: feature_token_account,
    programAuthority: program_authority,
    tokenProgram: TOKEN_PROGRAM_ID
  }).instruction();
}


export const withdrawTokensInstruction = async (
  amount: number,
  mint: PublicKey,
  withdrawer: PublicKey,
  withdrawerTokenAccount: PublicKey,
  program: Program<MonoProgram>,
) : Promise<TransactionInstruction> => {
  const [lancer_token_program_authority, lancer_token_program_authority_bump] = await findLancerProgramAuthority(
    program
  );
  const [lancer_dao_token_account] = await findLancerTokenAccount(
    mint,
    program
  );


  return await program.methods.withdrawTokens(new anchor.BN(amount), lancer_token_program_authority_bump)
    .accounts({
      lancerAdmin: LANCER_ADMIN,
      withdrawer: withdrawer,
      withdrawerTokenAccount: withdrawerTokenAccount,
      mint: mint,
      lancerDaoTokenAccount: lancer_dao_token_account,
      lancerTokenProgramAuthority: lancer_token_program_authority,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).instruction()

}

export const enableMultipleSubmittersInstruction = async (
  timestamp: string,
  creator: PublicKey,
  program: Program<MonoProgram>,
): Promise<TransactionInstruction> =>  {

  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );

  return await program.methods.enableMultipleSubmitters()
    .accounts({
      creator: creator,
      featureDataAccount: feature_data_account,
    }).instruction()

}

export const submitRequestMultipleInstruction = async (
  timestamp: string,
  creator: PublicKey,
  submitter: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> =>  {
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );
  return await program.methods.submitRequestMultiple()
      .accounts({
        creator: creator,
        submitter: submitter,
        featureDataAccount: feature_data_account,
      }).instruction();
}

export const setShareMultipleSubmittersInstruction = async (
  timestamp: string,
  creator: PublicKey,
  submitter: PublicKey,  
  submitter_share: number,
  program: Program<MonoProgram>,
) => {
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );

  return await program.methods.setShareMultipleSubmitters(submitter, submitter_share)
    .accounts({
      creator: creator,
      featureDataAccount: feature_data_account
    }).instruction()
}

export const approveRequestMultipleTransaction = async (
  timestamp: string,
  creator: PublicKey,
  mint: PublicKey,
  program: Program<MonoProgram>,
  third_party?: PublicKey,
): Promise<Transaction> =>  {
  let modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
    units: 1400000
  });
  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 1
  });
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );
  const [lancer_token_program_authority, lancer_token_program_authority_bump] = await findLancerProgramAuthority(
    program
  );
  const [lancer_dao_token_account] = await findLancerTokenAccount(
    mint,
    program
  );
  const [program_authority] = await findProgramAuthority(
    program,
  );
  const [feature_token_account] = await findFeatureTokenAccount(
    timestamp, 
    creator,
    mint, 
    program,
  );

  let submitter1 = PublicKey.default;
  let submitter2 = PublicKey.default;
  let submitter3 = PublicKey.default;
  let submitter4 = PublicKey.default;
  let submitter5 = PublicKey.default;

  let fetch_submitters = await program.account.featureDataAccount.fetch(feature_data_account);
  let no_of_submitters = fetch_submitters.noOfSubmitters;

  if (fetch_submitters.approvedSubmitters[0].toString() != submitter1.toString())
  {
    submitter1 = await getAssociatedTokenAddress(mint, fetch_submitters.approvedSubmitters[0])
    console.log("submitter 1 token accoun", submitter1.toString())
  }
  if (fetch_submitters.approvedSubmitters[1].toString() != submitter2.toString())
  {
    submitter2 = await getAssociatedTokenAddress(mint, fetch_submitters.approvedSubmitters[1])
  }
  if (fetch_submitters.approvedSubmitters[2].toString() != submitter3.toString())
  {
    submitter3 = await getAssociatedTokenAddress(mint, fetch_submitters.approvedSubmitters[2])
  }
  if (fetch_submitters.approvedSubmitters[3].toString() != submitter4.toString())
  {
    submitter4 = await getAssociatedTokenAddress(mint, fetch_submitters.approvedSubmitters[3])
  }
  if (fetch_submitters.approvedSubmitters[4].toString() != submitter5.toString())
  {
    submitter5 = await getAssociatedTokenAddress(mint, fetch_submitters.approvedSubmitters[4])
  }

  let approve_request_multiple_ix;
  if (third_party) {
    let third_party_token_account = await getAssociatedTokenAddress(mint, third_party);
    approve_request_multiple_ix = await program.methods.approveRequestMultipleThirdParty()
      .accounts({
        creator: creator,
        featureDataAccount: feature_data_account,
        featureTokenAccount: feature_token_account,
        lancerDaoTokenAccount: lancer_dao_token_account,
        lancerTokenProgramAuthority: lancer_token_program_authority,
        programAuthority: program_authority,
        thirdParty: third_party_token_account,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .remainingAccounts([
        { pubkey: submitter1, isSigner: false, isWritable: true},
        { pubkey: submitter2, isSigner: false, isWritable: true},
        { pubkey: submitter3, isSigner: false, isWritable: true},
        { pubkey: submitter4, isSigner: false, isWritable: true},
        { pubkey: submitter5, isSigner: false, isWritable: true},
      ])
      .instruction();

  }
  else
  {
    approve_request_multiple_ix = await program.methods.approveRequestMultiple()
      .accounts({
        creator: creator,
        featureDataAccount: feature_data_account,
        featureTokenAccount: feature_token_account,
        lancerDaoTokenAccount: lancer_dao_token_account,
        lancerTokenProgramAuthority: lancer_token_program_authority,
        programAuthority: program_authority,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .remainingAccounts([
        { pubkey: submitter1, isSigner: false, isWritable: true},
        { pubkey: submitter2, isSigner: false, isWritable: true},
        { pubkey: submitter3, isSigner: false, isWritable: true},
        { pubkey: submitter4, isSigner: false, isWritable: true},
        { pubkey: submitter5, isSigner: false, isWritable: true},
      ])
      .instruction();
  }
  const transaction = new Transaction()
  .add(modifyComputeUnits)
  .add(addPriorityFee)
  .add(approve_request_multiple_ix);

  return transaction;
}