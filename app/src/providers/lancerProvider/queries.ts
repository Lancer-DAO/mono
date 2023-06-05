import { PublicKey } from "@solana/web3.js";
import { getFeatureFundingAccount } from "@/escrow/adapters";
import axios from "axios";
import Base58 from "base-58";
import {
  EscrowContract,
  Issue,
  BOUNTY_USER_RELATIONSHIP,
  Contributor,
  User,
} from "@/src/types";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { AnchorProvider, Program } from "@project-serum/anchor";

export const getEscrowContractKey = async (
  creator: PublicKey,
  timestamp: string,
  program: Program<MonoProgram>,
  provider: AnchorProvider
) => {
  const accounts = await provider.connection.getParsedProgramAccounts(
    program.programId, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    {
      filters: [
        {
          dataSize: 288, // number of bytes
        },
        {
          memcmp: {
            offset: 8, // number of bytes
            bytes: creator.toBase58(), // base58 encoded string
          },
        },
        {
          memcmp: {
            offset: 275, // number of bytes
            bytes: Base58.encode(Buffer.from(timestamp)), // base58 encoded string
          },
        },
      ],
    }
  );
  return accounts[0].pubkey;
};
