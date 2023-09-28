import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { MonoProgram } from "./types/mono_program";

import {
  DISPUTE,
  LANCER_ADMIN,
  LANCER_COMPANY_TOKENS,
  LANCER_COMPLETER_TOKENS,
  LANCER_DAO,
  MINT_AUTHORITY,
  MONO_DATA,
  REFERRER,
} from "./constants";

import { PublicKey } from "@solana/web3.js";

// TODO write docs on sdk functions

/**
 *
 * @param unix_timestamp
 * @param creator
 * @param funds_mint
 * @param program
 * @returns
 */
export const findFeatureTokenAccount = async (
  unix_timestamp: String,
  creator: anchor.web3.PublicKey,
  funds_mint: anchor.web3.PublicKey,
  program: Program<MonoProgram>
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from(MONO_DATA),
      Buffer.from(unix_timestamp),
      creator.toBuffer(),
      funds_mint.toBuffer(),
    ],
    program.programId
  );
};

/**
 *
 * @param creator
 * @param program
 * @returns
 */
export const findFeatureAccount = async (
  unix_timestamp: string,
  creator: anchor.web3.PublicKey,
  program: Program<MonoProgram>
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from(MONO_DATA),
      anchor.utils.bytes.utf8.encode(unix_timestamp),
      creator.toBuffer(),
    ],
    program.programId
  );
};

/**
 *
 * @param program
 * @returns
 */
export const findProgramAuthority = async (
  program: Program<MonoProgram>
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(MONO_DATA)],
    program.programId
  );
};

/**
 *
 * @param funds_mint
 * @param program
 * @returns
 */
export const findLancerTokenAccount = async (
  funds_mint: PublicKey,
  program: Program<MonoProgram>
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(MONO_DATA), Buffer.from(LANCER_DAO), funds_mint.toBuffer()],
    program.programId
  );
};

export const findLancerProgramAuthority = async (
  program: Program<MonoProgram>
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(LANCER_DAO)],
    program.programId
  );
};

export const findLancerCompleterTokens = async (
  program: Program<MonoProgram>
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddressSync(
    [LANCER_ADMIN.toBuffer(), Buffer.from(LANCER_COMPLETER_TOKENS)],
    program.programId
  );
};

/**
 *
 * @param program
 * @returns
 */
export const findLancerCompanyTokens = async (
  program: Program<MonoProgram>
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddressSync(
    [LANCER_ADMIN.toBuffer(), Buffer.from(LANCER_COMPANY_TOKENS)],
    program.programId
  );
};

export const findProgramMintAuthority = async (
  program: Program<MonoProgram>
) => {
  return await anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(MINT_AUTHORITY)],
    program.programId
  );
};

export const findReferralDataAccount = async (
  creator: PublicKey,
  feature_data_account: PublicKey,
  program: Program<MonoProgram>
) => {
  return await anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from(REFERRER),
      feature_data_account.toBuffer(),
      creator.toBuffer(),
    ],
    program.programId
  );
};

export const findDisputeAccount = async (
  timestamp: string,
  creator: PublicKey,
  mint: PublicKey,
  program: Program<MonoProgram>
) => {
  return await anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from(DISPUTE),
      anchor.utils.bytes.utf8.encode(timestamp),
      creator.toBuffer(),
      mint.toBuffer(),
    ],
    program.programId
  );
};
