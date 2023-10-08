import * as anchor from "@project-serum/anchor";
import { AnchorError, IdlTypes, Program } from "@project-serum/anchor";
import { MonoProgram } from "./types/mono_program";

import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import {
  AccountMeta,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  Signer,
  Struct,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  findDisputeAccount,
  findFeatureAccount,
  findFeatureTokenAccount,
  findLancerCompanyTokens,
  findLancerCompleterTokens,
  findLancerProgramAuthority,
  findLancerTokenAccount,
  findProgramAuthority,
  findProgramMintAuthority,
  findReferralDataAccount,
} from "./pda";
import { LANCER_ADMIN } from "./constants";
import { min } from "bn.js";
import { program } from "@project-serum/anchor/dist/cjs/native/system";

export const createFeatureFundingAccountInstruction = async (
  mint: PublicKey,
  creator: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> => {
  const timestamp = Date.now().toString();
  const [feature_account] = await findFeatureAccount(
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

  return await program.methods
    .createFeatureFundingAccount(timestamp)
    .accounts({
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
};

export const createCustodialFeatureFundingAccountInstruction = async (
  mint: PublicKey,
  custodial_fee_payer: PublicKey,
  creator: PublicKey,
  program: Program<MonoProgram>
): Promise<{
  ix: TransactionInstruction;
  account: PublicKey;
  timestamp: string;
}> => {
  const timestamp = Date.now().toString();
  const [feature_account] = await findFeatureAccount(
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

  return {
    ix: await program.methods
      .createCustodialFeatureFundingAccount(timestamp)
      .accounts({
        creator: creator,
        custodialFeePayer: custodial_fee_payer,
        fundsMint: mint,
        featureDataAccount: feature_account,
        featureTokenAccount: feature_token_account,
        programAuthority: program_authority,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        associatedProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction(),
    account: feature_account,
    timestamp: timestamp,
  };
};

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

  return await program.methods
    .fundFeature(new anchor.BN(amount))
    .accounts({
      creator: creator,
      creatorTokenAccount: creator_token_account,
      fundsMint: mint,
      featureDataAccount: feature_data_account,
      featureTokenAccount: feature_token_account,
      programAuthority: program_authority,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
};

export const addApprovedSubmittersInstruction = async (
  timestamp: string,
  creator: PublicKey,
  submitter: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> => {
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );

  return await program.methods
    .addApprovedSubmitters()
    .accounts({
      creator: creator,
      submitter: submitter,
      featureDataAccount: feature_data_account,
    })
    .instruction();
};

export const addApprovedSubmittersV1Instruction = async (
  timestamp: string,
  creator: PublicKey,
  referrer: PublicKey,
  submitter: PublicKey,
  remainingAccounts: AccountMeta[],
  program: Program<MonoProgram>
): Promise<TransactionInstruction> => {
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );
  let [referral_data_account] = await findReferralDataAccount(
    creator,
    feature_data_account,
    program
  );

  return await program.methods
    .addApprovedSubmittersV1()
    .accounts({
      creator: creator,
      submitter: submitter,
      referrer: referrer,
      referralDataAccount: referral_data_account,
      featureDataAccount: feature_data_account,
    })
    .remainingAccounts(remainingAccounts)
    .instruction();
};

export const removeApprovedSubmittersInstruction = async (
  timestamp: string,
  creator: PublicKey,
  submitter: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> => {
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );

  return await program.methods
    .removeApprovedSubmitters()
    .accounts({
      creator: creator,
      submitter: submitter,
      featureDataAccount: feature_data_account,
    })
    .instruction();
};

export const removeApprovedSubmittersV1Instruction = async (
  timestamp: string,
  creator: PublicKey,
  submitter: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> => {
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );
  let [referral_data_account] = await findReferralDataAccount(
    creator,
    feature_data_account,
    program
  );

  return await program.methods
    .removeApprovedSubmittersV1()
    .accounts({
      creator: creator,
      submitter: submitter,
      referralDataAccount: referral_data_account,
      featureDataAccount: feature_data_account,
    })
    .instruction();
};

export const submitRequestInstruction = async (
  timestamp: string,
  creator: PublicKey,
  submitter: PublicKey,
  submitter_token_account: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> => {
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );

  return await program.methods
    .submitRequest()
    .accounts({
      creator: creator,
      submitter: submitter,
      payoutAccount: submitter_token_account,
      featureDataAccount: feature_data_account,
    })
    .instruction();
};

export const denyRequestInstruction = async (
  timestamp: string,
  creator: PublicKey,
  submitter: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> => {
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );

  return await program.methods
    .denyRequest()
    .accounts({
      creator: creator,
      submitter: submitter,
      featureDataAccount: feature_data_account,
    })
    .instruction();
};

export const approveRequestInstruction = async (
  timestamp: string,
  // payout_completer_tokens_account: PublicKey,
  // creator_company_tokens_account: PublicKey,
  creator: PublicKey,
  submitter: PublicKey,
  submitter_token_account: PublicKey,
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

  const [lancer_dao_token_account] = await findLancerTokenAccount(
    mint,
    program
  );

  const [lancer_token_program_authority] = await findLancerProgramAuthority(
    program
  );

  return await program.methods
    .approveRequest() // TODO remove this
    .accounts({
      creator: creator,
      submitter: submitter,
      payoutAccount: submitter_token_account,
      featureDataAccount: feature_data_account,
      featureTokenAccount: feature_token_account,
      programAuthority: program_authority,
      lancerDaoTokenAccount: lancer_dao_token_account,
      lancerTokenProgramAuthority: lancer_token_program_authority,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
};

export const approveRequestWithReferralInstruction = async (
  timestamp: string,
  creator: PublicKey,
  submitter: PublicKey,
  submitter_token_account: PublicKey,
  buddylinkProgramId: PublicKey,
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

  const [lancer_dao_token_account] = await findLancerTokenAccount(
    mint,
    program
  );
  let [referral_data_account] = await findReferralDataAccount(
    creator,
    feature_data_account,
    program
  );

  const [lancer_token_program_authority] = await findLancerProgramAuthority(
    program
  );

  const referralAccount = await program.account.referralDataAccount.fetch(
    referral_data_account
  );

  const creatorReferrer =
    referralAccount.creatorReferrer.toString() === PublicKey.default.toString()
      ? []
      : [
          {
            pubkey: referralAccount.creatorReferrer,
            isWritable: true,
            isSigner: false,
          },
          {
            pubkey: referralAccount.creatorMember,
            isWritable: true,
            isSigner: false,
          },
        ];

  const remainingAccounts = [
    { pubkey: buddylinkProgramId, isWritable: false, isSigner: false },
    { pubkey: mint, isWritable: false, isSigner: false },
    ...referralAccount.approvedReferrers
      .filter(
        (referrer) => referrer.toString() !== PublicKey.default.toString()
      )
      .map((referrer) => ({
        pubkey: referrer,
        isWritable: true,
        isSigner: false,
      })),
    ...creatorReferrer,
  ];
  return await program.methods
    .approveRequestWithReferral()
    .accounts({
      creator: creator,
      submitter: submitter,
      payoutAccount: submitter_token_account,
      featureDataAccount: feature_data_account,
      featureTokenAccount: feature_token_account,
      programAuthority: program_authority,
      referralDataAccount: referral_data_account,
      lancerDaoTokenAccount: lancer_dao_token_account,
      lancerTokenProgramAuthority: lancer_token_program_authority,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .remainingAccounts(remainingAccounts)
    .instruction();
};

export const approveRequestPartialInstruction = async (
  timestamp: string,
  creator: PublicKey,
  submitter: PublicKey,
  submitter_token_account: PublicKey,
  mint: PublicKey,
  amount: number,
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

  const [lancer_dao_token_account] = await findLancerTokenAccount(
    mint,
    program
  );

  const [lancer_token_program_authority] = await findLancerProgramAuthority(
    program
  );

  return await program.methods
    .approveRequestPartial(new anchor.BN(amount)) // TODO remove this
    .accounts({
      creator: creator,
      submitter: submitter,
      payoutAccount: submitter_token_account,
      featureDataAccount: feature_data_account,
      featureTokenAccount: feature_token_account,
      programAuthority: program_authority,
      lancerDaoTokenAccount: lancer_dao_token_account,
      lancerTokenProgramAuthority: lancer_token_program_authority,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
};

export const createLancerTokenAccountInstruction = async (
  funds_mint: PublicKey,
  program: Program<MonoProgram>
) => {
  const [lancer_token_program_authority] = await findLancerProgramAuthority(
    program
  );

  const [lancer_dao_token_account] = await findLancerTokenAccount(
    funds_mint,
    program
  );

  return await program.methods
    .createLancerTokenAccount()
    .accounts({
      lancerAdmin: LANCER_ADMIN,
      fundsMint: funds_mint,
      lancerDaoTokenAccount: lancer_dao_token_account,
      programAuthority: lancer_token_program_authority,
    })
    .instruction();
};

export const voteToCancelInstruction = async (
  timestamp: string,
  creator: PublicKey,
  voter: PublicKey,
  isCancel: boolean,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> => {
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );

  return await program.methods
    .voteToCancel(isCancel)
    .accounts({
      creator: creator,
      voter: voter,
      featureDataAccount: feature_data_account,
    })
    .instruction();
};

export const cancelFeatureInstruction = async (
  timestamp: string,
  creator: PublicKey,
  creator_token_account: PublicKey,
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

  return await program.methods
    .cancelFeature()
    .accounts({
      creator: creator,
      creatorTokenAccount: creator_token_account,
      featureDataAccount: feature_data_account,
      featureTokenAccount: feature_token_account,
      programAuthority: program_authority,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
};

export const withdrawTokensInstruction = async (
  amount: number,
  mint: PublicKey,
  withdrawer: PublicKey,
  withdrawerTokenAccount: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> => {
  const [lancer_token_program_authority, lancer_token_program_authority_bump] =
    await findLancerProgramAuthority(program);
  const [lancer_dao_token_account] = await findLancerTokenAccount(
    mint,
    program
  );

  return await program.methods
    .withdrawTokens(new anchor.BN(amount), lancer_token_program_authority_bump)
    .accounts({
      lancerAdmin: LANCER_ADMIN,
      withdrawer: withdrawer,
      withdrawerTokenAccount: withdrawerTokenAccount,
      mint: mint,
      lancerDaoTokenAccount: lancer_dao_token_account,
      lancerTokenProgramAuthority: lancer_token_program_authority,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
};

export const enableMultipleSubmittersInstruction = async (
  timestamp: string,
  creator: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> => {
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );

  return await program.methods
    .enableMultipleSubmitters()
    .accounts({
      creator: creator,
      featureDataAccount: feature_data_account,
    })
    .instruction();
};

export const submitRequestMultipleInstruction = async (
  timestamp: string,
  creator: PublicKey,
  submitter: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> => {
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );
  return await program.methods
    .submitRequestMultiple()
    .accounts({
      creator: creator,
      submitter: submitter,
      featureDataAccount: feature_data_account,
    })
    .instruction();
};

export const setShareMultipleSubmittersInstruction = async (
  timestamp: string,
  creator: PublicKey,
  submitter: PublicKey,
  submitter_share: number,
  program: Program<MonoProgram>
) => {
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );

  return await program.methods
    .setShareMultipleSubmitters(submitter, submitter_share)
    .accounts({
      creator: creator,
      featureDataAccount: feature_data_account,
    })
    .instruction();
};

export const createReferralDataAccountInstruction = async (
  creator: PublicKey,
  feature_data_account: PublicKey,
  referrer: PublicKey,
  remainingAccounts: AccountMeta[],
  program: Program<MonoProgram>
): Promise<TransactionInstruction> => {
  let [referral_data_account] = await findReferralDataAccount(
    creator,
    feature_data_account,
    program
  );

  return await program.methods
    .createReferralDataAccount()
    .accounts({
      creator: creator,
      featureDataAccount: feature_data_account,
      referralDataAccount: referral_data_account,
      referrer: referrer,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    })
    .remainingAccounts(remainingAccounts)
    .instruction();
};

export const createCustodialReferralDataAccountInstruction = async (
  creator: PublicKey,
  custodial_fee_payer: PublicKey,
  feature_data_account: PublicKey,
  program: Program<MonoProgram>,
  referrer?: PublicKey,
  remainingAccounts?: AccountMeta[]
): Promise<TransactionInstruction> => {
  let [referral_data_account] = await findReferralDataAccount(
    creator,
    feature_data_account,
    program
  );

  if (!referrer) {
    referrer = PublicKey.default;
  }

  return await program.methods
    .createCustodialReferralDataAccount()
    .accounts({
      creator: creator,
      custodialFeePayer: custodial_fee_payer,
      featureDataAccount: feature_data_account,
      referrer: referrer,
      referralDataAccount: referral_data_account,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    })
    .remainingAccounts(remainingAccounts)
    .instruction();
};

export const approveRequestMultipleTransaction = async (
  timestamp: string,
  creator: PublicKey,
  mint: PublicKey,
  has_referrer: boolean,
  program: Program<MonoProgram>
): Promise<Transaction> => {
  let modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
    units: 1400000,
  });
  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 1,
  });
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );
  const [lancer_token_program_authority, lancer_token_program_authority_bump] =
    await findLancerProgramAuthority(program);
  const [lancer_dao_token_account] = await findLancerTokenAccount(
    mint,
    program
  );
  const [program_authority] = await findProgramAuthority(program);
  const [feature_token_account] = await findFeatureTokenAccount(
    timestamp,
    creator,
    mint,
    program
  );

  let submitter1 = PublicKey.default;
  let submitter2 = PublicKey.default;
  let submitter3 = PublicKey.default;
  let submitter4 = PublicKey.default;
  let submitter5 = PublicKey.default;

  // @ts-ignore
  let fetch_submitters = await program.account.featureDataAccount.fetch(
    feature_data_account
  );
  let no_of_submitters = fetch_submitters.noOfSubmitters;

  if (
    fetch_submitters.approvedSubmitters[0].toString() != submitter1.toString()
  ) {
    submitter1 = await getAssociatedTokenAddress(
      mint,
      fetch_submitters.approvedSubmitters[0]
    );
  }
  if (
    fetch_submitters.approvedSubmitters[1].toString() != submitter2.toString()
  ) {
    submitter2 = await getAssociatedTokenAddress(
      mint,
      fetch_submitters.approvedSubmitters[1]
    );
  }
  if (
    fetch_submitters.approvedSubmitters[2].toString() != submitter3.toString()
  ) {
    submitter3 = await getAssociatedTokenAddress(
      mint,
      fetch_submitters.approvedSubmitters[2]
    );
  }
  if (
    fetch_submitters.approvedSubmitters[3].toString() != submitter4.toString()
  ) {
    submitter4 = await getAssociatedTokenAddress(
      mint,
      fetch_submitters.approvedSubmitters[3]
    );
  }
  if (
    fetch_submitters.approvedSubmitters[4].toString() != submitter5.toString()
  ) {
    submitter5 = await getAssociatedTokenAddress(
      mint,
      fetch_submitters.approvedSubmitters[4]
    );
  }

  let approve_request_multiple_ix;
  let [referral_data_account] = await findReferralDataAccount(
    creator,
    feature_data_account,
    program
  );

  if (has_referrer) {
    approve_request_multiple_ix = await program.methods
      .approveRequestMultipleWithReferral()
      .accounts({
        creator: creator,
        featureDataAccount: feature_data_account,
        featureTokenAccount: feature_token_account,
        lancerDaoTokenAccount: lancer_dao_token_account,
        lancerTokenProgramAuthority: lancer_token_program_authority,
        programAuthority: program_authority,
        referralDataAccount: referral_data_account,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts([
        { pubkey: submitter1, isSigner: false, isWritable: true },
        { pubkey: submitter2, isSigner: false, isWritable: true },
        { pubkey: submitter3, isSigner: false, isWritable: true },
        { pubkey: submitter4, isSigner: false, isWritable: true },
        { pubkey: submitter5, isSigner: false, isWritable: true },
      ])
      .instruction();
  } else {
    approve_request_multiple_ix = await program.methods
      .approveRequestMultiple()
      .accounts({
        creator: creator,
        featureDataAccount: feature_data_account,
        featureTokenAccount: feature_token_account,
        lancerDaoTokenAccount: lancer_dao_token_account,
        lancerTokenProgramAuthority: lancer_token_program_authority,
        programAuthority: program_authority,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts([
        { pubkey: submitter1, isSigner: false, isWritable: true },
        { pubkey: submitter2, isSigner: false, isWritable: true },
        { pubkey: submitter3, isSigner: false, isWritable: true },
        { pubkey: submitter4, isSigner: false, isWritable: true },
        { pubkey: submitter5, isSigner: false, isWritable: true },
      ])
      .instruction();
  }
  const transaction = new Transaction()
    .add(modifyComputeUnits)
    .add(addPriorityFee)
    .add(approve_request_multiple_ix);

  return transaction;
};

export const custodialTransaction = async (
  connection: Connection,
  instruction: TransactionInstruction,
  // payer: PublicKey,
  backend_signer: Signer
): Promise<Transaction> => {
  const tx = new Transaction();
  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  //@ts-ignore
  tx.add(instruction);
  tx.sign(backend_signer);
  // tx.partialSign(signer);
  tx.feePayer = backend_signer.publicKey;
  // const rawTx = tx.serialize();
  // const signature = await connection.sendRawTransaction(rawTx);
  // const serializedTx = tx.serialize({requireAllSignatures: false});

  // return serializedTx;
  return tx;
  // const signedTx = await signTransaction(tx)
  // const txId = await sendTransaction(signedTx, connection,{signers:[]});
};

export const sendInvoiceInstruction = async (
  timestamp: string,
  amount: number,
  creator: PublicKey,
  new_creator: PublicKey,
  mint: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> => {
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );

  return await program.methods
    .sendInvoice(new anchor.BN(amount))
    .accounts({
      creator: creator,
      newCreator: new_creator,
      fundsMint: mint,
      featureDataAccount: feature_data_account,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
};

export const acceptInvoiceInstruction = async (
  timestamp: string,
  creator: PublicKey,
  new_creator: PublicKey,
  mint: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> => {
  const new_creator_token_account = await getAssociatedTokenAddress(
    mint,
    new_creator
  );
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

  const [new_feature_data_account] = await findFeatureAccount(
    timestamp,
    new_creator,
    program
  );
  const [new_feature_token_account] = await findFeatureTokenAccount(
    timestamp,
    new_creator,
    mint,
    program
  );

  return await program.methods
    .acceptInvoice()
    .accounts({
      newCreator: new_creator,
      newCreatorTokenAccount: new_creator_token_account,
      fundsMint: mint,
      newFeatureDataAccount: new_feature_data_account,
      newFeatureTokenAccount: new_feature_token_account,
      programAuthority: program_authority,
      creator: creator,
      featureDataAccount: feature_data_account,
      featureTokenAccount: feature_token_account,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
      associatedProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
};

export const rejectInvoiceInstruction = async (
  timestamp: string,
  creator: PublicKey,
  invoice_acceptor: PublicKey,
  mint: PublicKey,
  program: Program<MonoProgram>
): Promise<TransactionInstruction> => {
  const [feature_data_account] = await findFeatureAccount(
    timestamp,
    creator,
    program
  );

  return await program.methods
    .rejectInvoice()
    .accounts({
      invoiceAcceptor: invoice_acceptor,
      creator: creator,
      fundsMint: mint,
      featureDataAccount: feature_data_account,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
};

export const closeInvoiceInstruction = async (
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

  return await program.methods
    .closeInvoice()
    .accounts({
      programAuthority: program_authority,
      creator: creator,
      featureDataAccount: feature_data_account,
      featureTokenAccount: feature_token_account,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
};

export const achFundFeatureInstruction = async (
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

  return await program.methods
    .achFundFeature(new anchor.BN(amount))
    .accounts({
      creator: creator,
      externalFunder: new PublicKey(
        "22222222222222222222222222222222222222222222"
      ),
      externalFunderTokenAccount: new PublicKey(
        "33333333333333333333333333333333333333333333"
      ),
      fundsMint: mint,
      featureDataAccount: feature_data_account,
      featureTokenAccount: feature_token_account,
      programAuthority: program_authority,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
};

export const adminCloseBountyInstruction = async (
  timestamp: string,
  creator: PublicKey,
  creator_token_account: PublicKey,
  mint: PublicKey,
  program: Program<MonoProgram>
) => {
  const [program_authority] = await findProgramAuthority(program);

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

  return await program.methods
    .adminCloseBounty()
    .accounts({
      lancerAdmin: LANCER_ADMIN,
      creator: creator,
      creatorTokenAccount: creator_token_account,
      featureDataAccount: feature_data_account,
      featureTokenAccount: feature_token_account,
      programAuthority: program_authority,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
};

export const createDisputeInstruction = async (
  timestamp,
  dispute_admin: PublicKey,
  creator: PublicKey,
  mint: PublicKey,
  program: Program<MonoProgram>
) => {
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

  const [dispute_account] = await findDisputeAccount(
    timestamp,
    creator,
    mint,
    program
  );

  return await program.methods
    .createDispute()
    .accounts({
      creator: creator,
      featureDataAccount: feature_data_account,
      featureTokenAccount: feature_token_account,
      programAuthority: program_authority,
      disputeAdmin: dispute_admin,
      disputeAccount: dispute_account,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
};

// TODO - make sure no instruction creates Token Accounts or make sure all instructions do
export const settleDisputeInstruction = async (
  timestamp,
  dispute_admin: PublicKey,
  creator: PublicKey,
  submitter: PublicKey,
  mint: PublicKey,
  amount: number,
  program: Program<MonoProgram>
) => {
  const [feature_token_account] = await findFeatureTokenAccount(
    timestamp,
    creator,
    mint,
    program
  );

  const [program_authority] = await findProgramAuthority(program);

  const [dispute_account] = await findDisputeAccount(
    timestamp,
    creator,
    mint,
    program
  );
  const [lancer_dao_token_account] = await findLancerTokenAccount(
    mint,
    program
  );

  const [lancer_token_program_authority] = await findLancerProgramAuthority(
    program
  );

  const creator_token_account = await getAssociatedTokenAddress(mint, creator);
  const submitter_token_account = await getAssociatedTokenAddress(
    mint,
    submitter
  );

  return await program.methods
    .settleDispute(new anchor.BN(amount))
    .accounts({
      disputeAdmin: dispute_admin,
      creator: creator,
      creatorTokenAccount: creator_token_account,
      submitter: submitter,
      submitterTokenAccount: submitter_token_account,
      lancerDaoTokenAccount: lancer_dao_token_account,
      lancerTokenProgramAuthority: lancer_token_program_authority,
      disputeAccount: dispute_account,
      featureTokenAccount: feature_token_account,
      programAuthority: program_authority,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
};
