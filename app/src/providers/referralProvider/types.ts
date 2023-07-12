import { AccountMeta, PublicKey } from "@solana/web3.js";
import { Claimable } from ".";
import { Treasury } from "@ladderlabs/buddy-sdk";

export type ITransactionInfo = {
  txId?: string;
  memberPDA?: PublicKey;
};

export interface IReferralContext {
  referralId: string;
  claimables: Claimable[];
  initialized: boolean;
  referrer: PublicKey;
  programId: PublicKey;
  getSubmitterReferrer: (submitter: PublicKey) => Promise<PublicKey>;
  claim: (treasury: Treasury) => Promise<ITransactionInfo | null>;
  createReferralMember: (mint?: PublicKey) => Promise<ITransactionInfo | null>;
  getRemainingAccounts: (
    wallet: PublicKey,
    mint: PublicKey
  ) => Promise<AccountMeta[]>;
}
