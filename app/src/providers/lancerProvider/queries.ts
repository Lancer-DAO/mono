import {
    PublicKey,
  } from "@solana/web3.js";
  import { getFeatureFundingAccount } from "@/escrow/adapters";
  import { getApiEndpoint } from "@/src/utils";
  import axios from "axios";
  import {
    ISSUES_API_ROUTE,
    ISSUE_ACCOUNT_ROUTE,
    ISSUE_API_ROUTE,
    UPDATE_ISSUE_ROUTE,
  } from "@/constants";
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


const getIssue = (uuid: string) =>
  axios.get(
    `${ISSUE_API_ROUTE}/${uuid}`
  );

const getIssues = (account?: string) =>
account ? axios.post(ISSUES_API_ROUTE, {uuid: account}):axios.get(
    ISSUES_API_ROUTE
  )  ;

const getAccounts = (uuid: string) =>
  axios.post(ISSUE_ACCOUNT_ROUTE, {uuid: uuid}
  );

  export const getEscrowContractKey = async (creator: PublicKey, timestamp: string, program: Program<MonoProgram>, provider: AnchorProvider) => {

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
